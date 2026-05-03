import BottomTabNavigation from "@/components/bottom-tab-navigation";
import GradientHeader from "@/components/gradient-header";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../config/firebaseConfig";
import { BACKEND_URL } from "../constants/apiConfig";

export default function StartDiagnosisPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const { imageUrl } = useLocalSearchParams();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const [reportData, setReportData] = useState<any>(null);

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useEffect(() => {
    const analyzeAndSaveReport = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("Cannot save: No user is currently logged in.");
          setIsAnalyzing(false);
          return;
        }

        const userReportsRef = collection(db, "users", user.uid, "reports");

        const q = query(
          userReportsRef,
          where("imageUrl", "==", imageUrl),
          limit(1),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Existing report found! Skipping ML prediction.");
          const existingData = querySnapshot.docs[0].data();

          setReportData({
            reportId: querySnapshot.docs[0].id,
            ...existingData,
          });
          setIsAnalyzing(false);
          return;
        }

        console.log("No previous report found. Sending to Python ML Engine...");

        // Using your actual laptop IP address!
        //const backendUrl = "http://192.168.1.14:5000/predict";
        //const backendUrl = "https://young-cats-notice.loca.lt/predict"
        const fetchUrl = `${BACKEND_URL}/predict`;

        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: imageUrl }),
        });

        if (!response.ok) {
          throw new Error(`Python Server Error: ${response.status}`);
        }

        const mlData = await response.json();

        const newReport = {
          date: new Date().toLocaleDateString(),
          imageId: "img_" + Date.now().toString(),
          imageUrl: imageUrl || null,
          predictedLesionType: mlData.diagnosis,
          modelConfidence: `${(mlData.confidence * 100).toFixed(2)}%`,
          heatmapBase64: mlData.gradcam_image
            ? `data:image/jpeg;base64,${mlData.gradcam_image}`
            : null,
          explanation:
            "Automated analysis completed using HAM10000 ensemble model. Please review the Grad-CAM heatmap for visual feature importance.",
        };

        const docRef = await addDoc(userReportsRef, {
          ...newReport,
          createdAt: serverTimestamp(),
        });

        console.log("Success: Real ML report saved to Firestore!");

        setReportData({ ...newReport, reportId: docRef.id });
        setIsAnalyzing(false);
      } catch (error: any) {
        console.error("Failed to process report:", error);
        Alert.alert(
          "Analysis Failed",
          "Could not complete the AI analysis. Please check your Python server terminal.",
        );
        setIsAnalyzing(false);
        router.back();
      }
    };

    if (imageUrl) {
      analyzeAndSaveReport();
    } else {
      setIsAnalyzing(false);
    }
  }, [imageUrl]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <View style={styles.container}>
        <GradientHeader title="Diagnosis Report" showBackArrow isSmallScreen={isSmallScreen} />

        {isAnalyzing || !reportData ? (
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
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reportIdSection}>
              <Text style={styles.reportIdText}>
                Report ID:{" "}
                <Text style={styles.reportIdValue}>{reportData.reportId}</Text>
              </Text>
            </View>

            <View style={styles.mainCard}>
              {/* Meta Info */}
              <Text style={styles.metaText}>Date: {reportData.date}</Text>
              <Text style={styles.metaText}>
                Image ID: {reportData.imageId}
              </Text>
              <Text style={styles.sectionTitle}>Diagnosis Summary</Text>
              <Text style={styles.infoText}>
                Predicted lesion type:{" "}
                <Text style={styles.infoValue}>
                  {reportData.predictedLesionType}
                </Text>
              </Text>

              <Text style={styles.infoText}>
                Model Confidence:{" "}
                <Text style={styles.infoValue}>
                  {reportData.modelConfidence}
                </Text>
              </Text>

              <Text style={styles.infoText}>
                <Text style={styles.infoValue}>Heatmap Visualization: </Text>
                Shows the regions of significance
              </Text>

              <View style={styles.heatmapContainer}>
                <Image
                  source={{
                    uri: reportData.heatmapBase64 || reportData.imageUrl,
                  }}
                  style={styles.heatmapImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.sectionTitleSmall}>Explanation</Text>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>
                  {reportData.explanation}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
        <BottomTabNavigation isSmallScreen={isSmallScreen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerSection: {
    backgroundColor: "#0a73ff",
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
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  reportIdText: {
    fontSize: 14,

    fontFamily: 'Inter-Regular',
    color: "#333333",
  },
  reportIdValue: {

    fontFamily: 'Inter-SemiBold',
    color: "#0a73ff",
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0a73ff",
    borderRadius: 12,
    padding: 16,
  },
  metaText: {
    fontSize: 14,

    fontFamily: 'Inter-Regular',
    color: "#333333",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,

    fontFamily: 'Inter-SemiBold',
    color: "#0a73ff",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 16,

    fontFamily: 'Inter-SemiBold',
    color: "#0a73ff",
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,

    fontFamily: 'Inter-Regular',
  },
  infoValue: {

    fontFamily: 'Inter-SemiBold',
    color: "#0a73ff",
  },
  heatmapContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  heatmapImage: {
    width: "95%",
    height: 220,
    borderWidth: 2,
    borderColor: "#000000",
  },
  explanationBox: {
    borderWidth: 1.5,
    borderColor: "#0a73ff",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  explanationText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 22,

    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-SemiBold',
    color: "#333333",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",

    fontFamily: 'Inter-Regular',
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
  imageComparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  scanImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
});
