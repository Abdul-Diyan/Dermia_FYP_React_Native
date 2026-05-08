import torch
import torch.nn as nn
from torchvision import models, transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import os
import numpy as np
import base64
import uuid
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import requests
import cv2
from skimage.feature import graycomatrix, graycoprops
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

torch.serialization.add_safe_globals([np.core.multiarray.scalar])
torch.serialization.add_safe_globals([np.ndarray])
if hasattr(np, '_core'):
    torch.serialization.add_safe_globals([np._core.multiarray.scalar])

app = Flask(__name__)
CORS(app)

foldername = '../public/lesionimages'
heatmaps_folder = '../public/heatmaps'

LABELS = {
    0: 'Actinic keratoses (akiec)',
    1: 'Basal cell carcinoma (bcc)',
    2: 'Benign keratosis-like lesions (bkl)',
    3: 'Dermatofibroma (df)',
    4: 'Melanoma (mel)',
    5: 'Melanocytic nevi (nv)',
    6: 'Vascular lesions (vasc)'
}

CLASS_LABELS = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']
FULL_NAMES = {
    'akiec': 'Actinic Keratosis / Intraepithelial Carcinoma',
    'bcc':   'Basal Cell Carcinoma',
    'bkl':   'Benign Keratosis-like Lesion',
    'df':    'Dermatofibroma',
    'mel':   'Melanoma',
    'nv':    'Melanocytic Naevus',
    'vasc':  'Vascular Lesion',
}

DERM7PT_CONCEPT_NAMES = [
    "pigment_network", "blue_whitish_veil", "vascular_structures",
    "pigmentation_irregular", "streaks", "dots_and_globules", "regression_structures",
]
STRUCTURAL_CONCEPT_NAMES = [
    "colour_uniformity", "border_irregularity", "texture_complexity", "vascular_colour_proxy",
]
ALL_CONCEPT_NAMES    = DERM7PT_CONCEPT_NAMES + STRUCTURAL_CONCEPT_NAMES
NUM_DERM7PT_CONCEPTS = len(DERM7PT_CONCEPT_NAMES)
NUM_STRUCTURAL       = len(STRUCTURAL_CONCEPT_NAMES)
NUM_CONCEPTS_TOTAL   = len(ALL_CONCEPT_NAMES)
CONCEPT_THRESHOLD    = 0.45

STRUCTURAL_DESCRIPTIVE = {
    0: ("colour_uniformity", ['mel', 'bkl', 'nv'], "relatively uniform colour", "colour heterogeneity"),
    1: ("border_irregularity", ['mel', 'bcc'], "well-defined border", "irregular border"),
    2: ("texture_complexity", ['mel'], "low surface texture complexity", "elevated surface texture complexity"),
}

CLINICAL_EXPECTED_HIGH = {
    'pigment_network':        ['mel', 'nv', 'bkl', 'df'],
    'blue_whitish_veil':      ['mel', 'bcc', 'akiec'],
    'vascular_structures':    ['bcc', 'df', 'akiec', 'vasc'],
    'pigmentation_irregular': ['mel', 'akiec'],
    'streaks':                ['mel', 'akiec'],
    'dots_and_globules':      ['mel', 'bcc', 'vasc'],
    'regression_structures':  ['mel', 'bkl'],
    'colour_uniformity':      ['nv', 'df'],
    'border_irregularity':    ['mel', 'akiec', 'bcc'],
    'texture_complexity':     ['bcc', 'akiec', 'mel'],
    'vascular_colour_proxy':  ['vasc', 'df'],
}
CLINICAL_EXPECTED_LOW = {
    'pigment_network':        ['vasc', 'bcc'],
    'blue_whitish_veil':      ['nv', 'df', 'vasc'],
    'vascular_structures':    ['nv', 'bkl'],
    'pigmentation_irregular': ['nv', 'df', 'bkl'],
    'streaks':                ['nv', 'bcc', 'vasc'],
    'dots_and_globules':      ['df', 'nv'],
    'regression_structures':  ['nv', 'vasc'],
    'colour_uniformity':      ['mel', 'bcc', 'akiec'],
    'border_irregularity':    ['nv', 'df'],
    'texture_complexity':     ['nv', 'df'],
    'vascular_colour_proxy':  ['mel', 'bkl', 'nv'],
}

RISK_LEVELS = {
    'mel':   'HIGH - Potential melanoma. Urgent dermatology referral.',
    'akiec': 'MODERATE-HIGH - Actinic keratosis / Bowen disease. Biopsy advised.',
    'bcc':   'MODERATE - Basal cell carcinoma. Specialist review.',
    'bkl':   'LOW - Seborrhoeic keratosis. Benign; monitor.',
    'df':    'LOW - Dermatofibroma. Benign.',
    'nv':    'LOW - Melanocytic naevus. Routine follow-up.',
    'vasc':  'LOW-MODERATE - Vascular lesion. Assess type.',
}
MEL_HEDGE_THRESHOLD = 0.75

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class DERMIAv2(nn.Module):
    def __init__(self):
        super().__init__()
        backbone      = models.efficientnet_b3(weights=None)
        in_features   = backbone.classifier[1].in_features
        self.backbone = nn.Sequential(*list(backbone.children())[:-1])
        self.concept_predictor = nn.Sequential(
            nn.Flatten(),
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, NUM_DERM7PT_CONCEPTS),
            nn.Sigmoid()
        )
        self.label_predictor = nn.Linear(NUM_CONCEPTS_TOTAL, 7)

    def forward(self, x, structural_concepts):
        features         = self.backbone(x)
        derm7pt_concepts = self.concept_predictor(features)
        all_concepts     = torch.cat([derm7pt_concepts, structural_concepts], dim=1)
        logits           = self.label_predictor(all_concepts)
        return logits, all_concepts, derm7pt_concepts

def create_model(model_name):
    if model_name == 'efficientnet_b3':
        backbone = models.efficientnet_b3(weights=None)
        in_features = backbone.classifier[1].in_features
        backbone.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 7)
        )
    elif model_name == 'efficientnet_b4':
        backbone = models.efficientnet_b4(weights=None)
        in_features = backbone.classifier[1].in_features
        backbone.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 7)
        )
    elif model_name == 'densenet121':
        backbone = models.densenet121(weights=None)
        in_features = backbone.classifier.in_features
        backbone.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 7)
        )
    elif model_name == 'convnext_small':
        backbone = models.convnext_small(weights=None)
        in_features = backbone.classifier[2].in_features
        backbone.classifier[2] = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 7)
        )
    else:
        raise ValueError(f"Unknown model: {model_name}")

    return backbone.to(device)

CHECKPOINT_NAMES = {
    'efficientnet_b3': 'models/efficientnet_b3.pth',
    'efficientnet_b4': 'models/efficientnet_b4.pth',
    'densenet121': 'models/densenet121.pth',
    'convnext_small': 'models/convnext_small.pth',
}

model_names = ['efficientnet_b3', 'efficientnet_b4', 'densenet121', 'convnext_small']
models_dict = {}
print("================ MODEL LOADING START ================")
for name in model_names:
    try:
        model = create_model(name)
        checkpoint_path = CHECKPOINT_NAMES[name]
        print(f"Attempting to load {name} from: {checkpoint_path}")
        
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)

        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)

        model.eval()
        models_dict[name] = model
        print(f"✅ Successfully loaded model: {name}")
    except Exception as e:
        print(f"❌ CRITICAL ERROR loading {name}: {str(e)}")
print(f"================ MODEL LOADING END. Total loaded: {len(models_dict)} ================")

# =============================================================================
# DERMIA concept model Loading
# =============================================================================
DERMIA_CHECKPOINT = 'models/dermia_v2_best.pth' # Assuming it is in your models folder
dermia_model      = None
dermia_W          = None

try:
    dermia_model = DERMIAv2().to(device)
    ckpt         = torch.load(DERMIA_CHECKPOINT, map_location=device, weights_only=False)
    dermia_model.load_state_dict(ckpt['model_state_dict'])
    dermia_model.eval()
    with torch.no_grad():
        dermia_W = dermia_model.label_predictor.weight.detach().cpu().numpy()
    print("✅ Successfully loaded concept model: DERMIAv2")
except Exception as e:
    print(f"❌ WARNING: concept model not loaded: {e}")
    print(f"           XAI textual explanations will be unavailable.")

# =============================================================================
# XAI - Structural Concept Computation & Report Helpers
# =============================================================================
def compute_structural_concepts(pil_image):
    img  = np.array(pil_image.convert('RGB'))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    hsv  = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)

    std_h             = hsv[:, :, 0].std() / 180.0
    colour_uniformity = float(1.0 - np.clip(std_h * 3, 0, 1))

    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        cnt  = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(cnt)
        peri = cv2.arcLength(cnt, True)
        circ = 4 * np.pi * area / (peri ** 2 + 1e-6)
        border_irregularity = float(1.0 - np.clip(circ, 0, 1))
    else:
        border_irregularity = 0.5

    g    = gray[::4, ::4]
    glcm = graycomatrix(g, [1], [0], 256, symmetric=True, normed=True)
    homogeneity        = float(graycoprops(glcm, 'homogeneity')[0, 0])
    texture_complexity = float(np.clip(1.0 - homogeneity, 0, 1))

    red_mean              = img[:, :, 0].mean() / 255.0
    dark_mean             = (255 - img.max(axis=2)).mean() / 255.0
    vascular_colour_proxy = float(np.clip(red_mean - dark_mean + 0.5, 0, 1))

    return np.array([colour_uniformity, border_irregularity, texture_complexity, vascular_colour_proxy], dtype=np.float32)

def _is_relevant(concept_name, pred_class):
    return (pred_class in CLINICAL_EXPECTED_HIGH.get(concept_name, []) or
            pred_class in CLINICAL_EXPECTED_LOW.get(concept_name, []))

def _counterfactual_is_clinically_valid(concept_idx, direction, pred_class):
    cname = ALL_CONCEPT_NAMES[concept_idx]
    if direction == 'present':
        return pred_class in CLINICAL_EXPECTED_HIGH.get(cname, [])
    else:
        return pred_class in CLINICAL_EXPECTED_LOW.get(cname, [])

def _counterfactual(concept_scores, pred_class_idx, W):
    weights    = W[pred_class_idx]
    candidates = []
    for i in range(NUM_DERM7PT_CONCEPTS):
        score = concept_scores[i]
        w     = weights[i]
        if score >= CONCEPT_THRESHOLD and w > 0:
            direction = 'present'
            impact    = score * w
        elif score < CONCEPT_THRESHOLD and w < 0:
            direction = 'absent'
            impact    = abs(w)
        else:
            continue
        if not _counterfactual_is_clinically_valid(i, direction, CLASS_LABELS[pred_class_idx]):
            continue
        candidates.append((i, impact, direction))

    if not candidates:
        return None

    top_idx, top_impact, direction = max(candidates, key=lambda x: x[1])
    top_name    = ALL_CONCEPT_NAMES[top_idx].replace('_', ' ')
    approx_drop = int(top_impact / (1 + top_impact) * 100)

    if direction == 'present':
        return f"If {top_name} were absent, the {CLASS_LABELS[pred_class_idx]} probability would decrease by approximately {approx_drop}%, making it the single most decisive detected feature for this prediction."
    else:
        return f"The absence of {top_name} contributes decisively to this prediction - if {top_name} were present, the {CLASS_LABELS[pred_class_idx]} probability would decrease by approximately {approx_drop}%."

def _wrap(text, width=68, indent="  "):
    words = text.split()
    lines = []
    line  = indent
    for word in words:
        if len(line) + len(word) + 1 > width:
            lines.append(line.rstrip())
            line = indent + word + " "
        else:
            line += word + " "
    if line.strip():
        lines.append(line.rstrip())
    return "\n".join(lines)

def _format_name_list(names):
    titled = [n.title() for n in names]
    if len(titled) == 1: return titled[0]
    elif len(titled) == 2: return f"{titled[0]} and {titled[1]}"
    else: return f"{', '.join(titled[:-1])}, and {titled[-1]}"

def generate_xai_report(concept_scores, ensemble_probs, ensemble_pred_idx, ensemble_confidence, W):
    pred_class = CLASS_LABELS[ensemble_pred_idx]
    sep        = "=" * 70
    thin       = "-" * 70

    present_confirming = []
    absent_confirming  = []

    for i, cname in enumerate(DERM7PT_CONCEPT_NAMES):
        if not _is_relevant(cname, pred_class): continue
        score    = float(concept_scores[i])
        present  = score >= CONCEPT_THRESHOLD
        display  = cname.replace('_', ' ').lower()
        exp_high = pred_class in CLINICAL_EXPECTED_HIGH.get(cname, [])
        exp_low  = pred_class in CLINICAL_EXPECTED_LOW.get(cname, [])

        if present and exp_high: present_confirming.append((display, score))
        elif not present and exp_low: absent_confirming.append((display, score))

    struct_scores   = concept_scores[NUM_DERM7PT_CONCEPTS:]
    struct_findings = []

    for struct_idx, (cname, relevant_classes, low_desc, high_desc) in STRUCTURAL_DESCRIPTIVE.items():
        if pred_class not in relevant_classes: continue
        score    = float(struct_scores[struct_idx])
        exp_high = pred_class in CLINICAL_EXPECTED_HIGH.get(cname, [])
        exp_low  = pred_class in CLINICAL_EXPECTED_LOW.get(cname, [])

        score_is_high = score > 0.50
        if not ((score_is_high and exp_high) or (not score_is_high and exp_low)): continue

        if score < 0.20: qualifier, description = "marked", high_desc
        elif score < 0.35: qualifier, description = "moderate", high_desc
        elif score > 0.65: qualifier, description = "clear", low_desc
        else: qualifier, description = "borderline", low_desc

        struct_findings.append(f"{qualifier} {description}")

    cf_sentence = _counterfactual(concept_scores, ensemble_pred_idx, W)

    lines = ["\n", "DERMOSCOPIC ANALYSIS REPORT"]
    
    if pred_class == 'mel' and ensemble_confidence < MEL_HEDGE_THRESHOLD:
        lines.append("  Assessment   : Features suggestive of Melanoma")
        lines.append(f"  Confidence   : {ensemble_confidence:.1%}  [below 75% - review differential before clinical action]")
    else:
        lines.append(f"  Assessment   : {FULL_NAMES[pred_class]}")
        lines.append(f"  Confidence   : {ensemble_confidence:.1%}")

    lines.append(f"  Risk level   : {RISK_LEVELS[pred_class]}")

    sorted_idxs = ensemble_probs.argsort()[::-1][:3]
    lines.append(f"  Differential : *{FULL_NAMES[CLASS_LABELS[sorted_idxs[0]]]} ({ensemble_probs[sorted_idxs[0]]:.1%})")
    for idx in sorted_idxs[1:]:
        lines.append(f"                 {FULL_NAMES[CLASS_LABELS[idx]]} ({ensemble_probs[idx]:.1%})")

    lines.append(thin)
    lines.append("  DERMOSCOPIC FINDINGS\n")

    # -------------------------------------------------------------------------
    # Assemble trimmed report (Dermoscopic Findings Only)
    # -------------------------------------------------------------------------
    lines = []

    if present_confirming or absent_confirming or struct_findings:
        parts = []
        if present_confirming:
            names = [n for n, _ in present_confirming]
            parts.append(f"The lesion demonstrates {_format_name_list(names)}")
        elif absent_confirming:
            names = [n for n, _ in absent_confirming]
            parts.append(f"{_format_name_list(names)} {'is' if len(names) == 1 else 'are'} absent")
        
        if struct_findings: 
            parts.append(f"Structural analysis reveals {'; '.join(struct_findings)}")
        
        prose = ". ".join(parts) + "."
        prose += f" These findings are consistent with a diagnosis of {FULL_NAMES[pred_class]}."
        lines.append(prose)
    else:
        lines.append("No positively confirming dermoscopic features were detected above threshold for this prediction. Clinical correlation and review of the ensemble differential is advised.")

    if cf_sentence:
        lines.append("")
        lines.append(cf_sentence)

    if pred_class == 'akiec':
        lines.append("")
        lines.append("Note: The concept model has no labelled actinic keratosis training examples from DERM7PT. Structural analysis has been suppressed for this class. Interpret with caution.")
    elif pred_class == 'df':
        lines.append("")
        lines.append("Note: Dermatofibroma has limited training examples. Structural concept scores for this class are less reliable.")
    elif pred_class in ('nv', 'vasc') and not present_confirming:
        lines.append("")
        lines.append("Note: This diagnosis is supported primarily by the absence of malignant features rather than the presence of class-specific markers.")

    return "\n".join(lines)

transform_224 = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

transform_260 = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

MODEL_TRANSFORMS = {
    'efficientnet_b3': transform_224,
    'efficientnet_b4': transform_260,
    'densenet121': transform_224,
    'convnext_small': transform_224,
}

def generate_gradcam_b64(input_tensor, original_image_pil, target_class):
    try:
        vis_model = models_dict.get('efficientnet_b3') or list(models_dict.values())[0]
        target_layers = [vis_model.features[-1]]

        cam = GradCAM(model=vis_model, target_layers=target_layers)
        targets = [ClassifierOutputTarget(target_class)]

        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        grayscale_cam = grayscale_cam[0, :]

        img_resized = original_image_pil.resize((224, 224))
        rgb_img = np.float32(img_resized) / 255.0

        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
        vis_pil = Image.fromarray(visualization)

        buffered = io.BytesIO()
        vis_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return img_str
    except Exception as e:
        return None

@app.route('/predict', methods=['POST'])
def predict():
    image_bytes = None

    if request.is_json and 'image_url' in request.json:
        image_url = request.json['image_url']
        print(f"--> Received Mobile Request for URL: {image_url}")
        try:
            resp = requests.get(image_url)
            if resp.status_code == 200:
                image_bytes = resp.content
                print("--> Successfully downloaded image from Cloudinary")
            else:
                return jsonify({'error': 'Failed to download image from Cloudinary'}), 400
        except Exception as e:
            return jsonify({'error': f'URL request failed: {str(e)}'}), 400

    elif 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            image_bytes = file.read()

    if image_bytes is None:
        return jsonify({'error': 'No valid image file or URL provided'}), 400

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        ensemble_probs = []
        gradcam_input_tensor = None

        with torch.no_grad():
            for name, model in models_dict.items():
                tfm = MODEL_TRANSFORMS.get(name, transform_224)
                input_tensor = tfm(image).unsqueeze(0).to(device)

                if name == 'efficientnet_b3' and gradcam_input_tensor is None:
                    gradcam_input_tensor = input_tensor

                outputs = model(input_tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                ensemble_probs.append(probs.cpu().numpy())

        if not ensemble_probs:
            return jsonify({'error': 'No models available for prediction'}), 500

        avg_probs = np.mean(ensemble_probs, axis=0)[0] 
        prediction_idx = int(np.argmax(avg_probs))
        confidence = float(np.max(avg_probs))

        if gradcam_input_tensor is None:
            gradcam_input_tensor = transform_224(image).unsqueeze(0).to(device)

        gradcam_b64 = generate_gradcam_b64(gradcam_input_tensor, image, prediction_idx)

        heatmap_url = None
        if gradcam_b64:
            try:
                print("--> Uploading heatmap to Cloudinary...")
                heatmap_bytes = base64.b64decode(gradcam_b64)
                upload_result = cloudinary.uploader.upload(
                    heatmap_bytes, 
                    folder="dermia/heatmaps"
                )
                heatmap_url = upload_result.get("secure_url")
            except Exception as cloud_err:
                print(f"Cloudinary upload failed: {cloud_err}")
                # Fallback: If cloud fails, you could still return base64 if needed

        xai_report = None
        if dermia_model is not None and dermia_W is not None:
            try:
                print("--> Generating XAI Report...")
                structural = compute_structural_concepts(image)
                struct_tensor = torch.tensor(structural, dtype=torch.float32).unsqueeze(0).to(device)
                dermia_input = transform_224(image).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    _, all_concepts, _ = dermia_model(dermia_input, struct_tensor)

                concept_scores = all_concepts[0].cpu().numpy()

                xai_report = generate_xai_report(
                    concept_scores=concept_scores,
                    ensemble_probs=avg_probs,
                    ensemble_pred_idx=prediction_idx,
                    ensemble_confidence=confidence,
                    W=dermia_W,
                )
                print("--> XAI Report Generated Successfully.")
            except Exception as xai_err:
                print(f"[xai] report generation failed: {xai_err}")

        # --- UPDATED RESPONSE ---
        return jsonify({
            'diagnosis': LABELS[prediction_idx],
            'confidence': float(f"{confidence:.4f}"),
            'prediction_index': prediction_idx,
            'heatmapImageURL': heatmap_url, # Now returning a Cloudinary URL
            'xai_report': xai_report
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = file.filename
        save_path = os.path.join(foldername, filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        file.save(save_path)
        return jsonify({'filepath': f'/lesionimages/{filename}'}), 200

@app.route('/delete', methods=['POST'])
def delete_file():
    data = request.get_json()
    filepath = data.get('filepath')

    if not filepath:
        return jsonify({'error': 'No filepath provided'}), 400

    filename = os.path.basename(filepath)
    target_path = os.path.join(foldername, filename)

    if os.path.exists(target_path):
        os.remove(target_path)
        return jsonify({'message': 'File deleted'}), 200
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    os.makedirs(foldername, exist_ok=True)
    os.makedirs(heatmaps_folder, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)