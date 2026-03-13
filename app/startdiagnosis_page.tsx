import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";

export default function StartDiagnosisPage() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const { imageUrl } = useLocalSearchParams();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // 1. Make reportData a state variable so we can update it after "Analysis"
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const analyzeAndSaveReport = async () => {
      // 2. Simulate the 3-second ML Model processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Generate the Mock Report Data
      const newReport = {
        reportId: `REP-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toLocaleDateString(),
        imageId: "img_9999", // We will eventually get this from Cloudinary
        imageUrl: imageUrl || null, // The Cloudinary URL we passed over!
        predictedLesionType: "Melanoma",
        modelConfidence: "94.77%",
        explanation:
          "The analyzed dermoscopic image exhibits distinct characteristics consistent with malignant melanoma.\nFrom an asymmetry perspective, the lesion shows clear imbalance in both structure and pigmentation across its vertical and horizontal axes.",
      };

      // 4. Save to Firestore Database securely
      try {
        const user = auth.currentUser;
        if (user) {
          // Path: users/{user_id}/reports/{auto_generated_id}
          const userReportsRef = collection(db, "users", user.uid, "reports");

          await addDoc(userReportsRef, {
            ...newReport,
            createdAt: serverTimestamp(), // Firebase time tracking
          });

          console.log("Success: Report securely saved to Firestore!");
        } else {
          console.error("Cannot save: No user is currently logged in.");
        }
      } catch (error) {
        console.error("Failed to save report to Firestore:", error);
      }

      setReportData(newReport);
      setIsAnalyzing(false);
    };

    // Only run the analysis if we actually received an image URL
    if (imageUrl) {
      analyzeAndSaveReport();
    } else {
      // Fallback if someone opens the page directly without an image
      setIsAnalyzing(false);
    }
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text
          style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
        >
          Diagnosis Report
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Main Content */}
      {isAnalyzing || !reportData ? (
        // SHOW THIS WHILE "ANALYZING" OR WAITING FOR DATA
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B9FE5" />
          <Text style={styles.loadingText}>
            Analyzing lesion with AI Model...
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a few moments.
          </Text>
        </View>
      ) : (
        // SHOW THIS WHEN DONE AND DATA EXISTS
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Report ID */}
          <View style={styles.reportIdSection}>
            <Text
              style={[
                styles.reportIdLabel,
                isSmallScreen && styles.reportIdLabelSmall,
              ]}
            >
              Report ID:{" "}
              <Text
                style={[
                  styles.reportIdValue,
                  isSmallScreen && styles.reportIdValueSmall,
                ]}
              >
                {reportData.reportId}
              </Text>
            </Text>
          </View>

          {/* Main Report Card */}
          <View
            style={[styles.reportCard, isSmallScreen && styles.reportCardSmall]}
          >
            {/* Basic Info */}
            {/* Show the actual uploaded image */}
            {imageUrl && (
              <View style={styles.uploadedImageContainer}>
                <Text style={styles.imageLabel}>Analyzed Image:</Text>
                <Image
                  source={{ uri: imageUrl as string }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Diagnosis Summary */}
            <View style={styles.summarySection}>
              <Text
                style={[
                  styles.summaryTitle,
                  isSmallScreen && styles.summaryTitleSmall,
                ]}
              >
                Diagnosis Summary
              </Text>

              <Text
                style={[
                  styles.summaryContent,
                  styles.marginTop,
                  isSmallScreen && styles.summaryContentSmall,
                ]}
              >
                Predicted lesion type:{" "}
                <Text style={styles.summaryValue}>
                  {reportData.predictedLesionType}
                </Text>
              </Text>

              <Text
                style={[
                  styles.summaryContent,
                  styles.marginTop,
                  isSmallScreen && styles.summaryContentSmall,
                ]}
              >
                Model Confidence:{" "}
                <Text style={styles.summaryValue}>
                  {reportData.modelConfidence}
                </Text>
              </Text>

              {/* Heatmap Visualization */}
              <View style={styles.heatmapSection}>
                <Text
                  style={[
                    styles.heatmapTitle,
                    isSmallScreen && styles.heatmapTitleSmall,
                  ]}
                >
                  Heatmap Visualization:
                </Text>
                <Text
                  style={[
                    styles.heatmapDescription,
                    styles.marginTop,
                    isSmallScreen && styles.heatmapDescriptionSmall,
                  ]}
                >
                  Shows the regions of significance
                </Text>

                {/* Heatmap Placeholder */}
                <View
                  style={[
                    styles.heatmapPlaceholder,
                    isSmallScreen && styles.heatmapPlaceholderSmall,
                  ]}
                >
                  <View style={styles.heatmapGradient} />
                </View>
              </View>
            </View>

            {/* Explanation Section */}
            <View style={styles.explanationSection}>
              <Text
                style={[
                  styles.explanationTitle,
                  isSmallScreen && styles.explanationTitleSmall,
                ]}
              >
                Explanation
              </Text>

              <View
                style={[
                  styles.explanationBox,
                  isSmallScreen && styles.explanationBoxSmall,
                ]}
              >
                <Text
                  style={[
                    styles.explanationText,
                    isSmallScreen && styles.explanationTextSmall,
                  ]}
                >
                  {reportData.explanation}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      {/* Bottom Tab Navigation */}
      <BottomTabNavigation isSmallScreen={isSmallScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerSection: {
    backgroundColor: "#3B9FE5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  headerTextSmall: {
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  reportIdSection: {
    marginBottom: 16,
  },
  reportIdLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  reportIdLabelSmall: {
    fontSize: 13,
  },
  reportIdValue: {
    color: "#3B9FE5",
    fontWeight: "700",
  },
  reportIdValueSmall: {
    fontSize: 14,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#3B9FE5",
    borderRadius: 16,
    padding: 20,
  },
  reportCardSmall: {
    padding: 14,
  },
  basicInfo: {
    marginBottom: 20,
  },
  basicInfoText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  basicInfoTextSmall: {
    fontSize: 12,
  },
  marginTop: {
    marginTop: 8,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B9FE5",
  },
  summaryTitleSmall: {
    fontSize: 15,
  },
  summaryContent: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  summaryContentSmall: {
    fontSize: 12,
  },
  summaryValue: {
    color: "#3B9FE5",
    fontWeight: "700",
  },
  heatmapSection: {
    marginTop: 20,
  },
  heatmapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B9FE5",
  },
  heatmapTitleSmall: {
    fontSize: 12,
  },
  heatmapDescription: {
    fontSize: 14,
    color: "#333333",
  },
  heatmapDescriptionSmall: {
    fontSize: 12,
  },
  heatmapPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#000000",
    borderRadius: 8,
    marginTop: 12,
    overflow: "hidden",
  },
  heatmapPlaceholderSmall: {
    height: 160,
  },
  heatmapGradient: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    backgroundImage:
      "radial-gradient(circle at center, rgba(255, 0, 0, 1), rgba(255, 255, 0, 0.8), rgba(0, 255, 0, 0.6), rgba(0, 0, 255, 1))",
    justifyContent: "center",
    alignItems: "center",
  },
  explanationSection: {
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B9FE5",
    marginBottom: 12,
  },
  explanationTitleSmall: {
    fontSize: 15,
    marginBottom: 10,
  },
  explanationBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#3B9FE5",
    borderRadius: 12,
    padding: 16,
  },
  explanationBoxSmall: {
    padding: 12,
  },
  explanationText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 22,
  },
  explanationTextSmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
  },
  uploadedImageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
