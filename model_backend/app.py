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

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

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

        avg_probs = np.mean(ensemble_probs, axis=0)
        prediction_idx = int(np.argmax(avg_probs))
        confidence = float(np.max(avg_probs))

        if gradcam_input_tensor is None:
            gradcam_input_tensor = transform_224(image).unsqueeze(0).to(device)

        gradcam_b64 = generate_gradcam_b64(gradcam_input_tensor, image, prediction_idx)

        heatmap_local_path = None
        if gradcam_b64:
            filename = f"heatmap_{uuid.uuid4().hex[:8]}.jpg"
            save_path = os.path.join(heatmaps_folder, filename)

            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, "wb") as fh:
                fh.write(base64.b64decode(gradcam_b64))

            heatmap_local_path = f"/heatmaps/{filename}"

        result = {
            'diagnosis': LABELS[prediction_idx],
            'confidence': float(f"{confidence:.4f}"),
            'prediction_index': prediction_idx,
            'gradcam_image': gradcam_b64,
            'heatmapImageURL': heatmap_local_path
        }
        return jsonify(result)

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