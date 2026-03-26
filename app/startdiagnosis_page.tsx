import BottomTabNavigation from "@/components/bottom-tab-navigation";
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
  Image,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../config/firebaseConfig";

export default function StartDiagnosisPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const { imageUrl } = useLocalSearchParams();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // 1. Make reportData a state variable so we can update it after "Analysis"
  const [reportData, setReportData] = useState<any>(null);

  // Dynamic status bar colors
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

        // 1. CHECK FIRESTORE FOR AN EXISTING REPORT FIRST
        const q = query(
          userReportsRef,
          where("imageUrl", "==", imageUrl),
          limit(1),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // WE FOUND IT! Load instantly and skip the ML model.
          console.log("Existing report found! Skipping ML prediction.");
          const existingData = querySnapshot.docs[0].data();

          setReportData({
            reportId: querySnapshot.docs[0].id, // Use the real database ID
            ...existingData,
          });
          setIsAnalyzing(false);
          return; // Exit the function early!
        }

       // 2. NO EXISTING REPORT FOUND. Send to Python Flask Server!
        console.log("No previous report found. Sending to Python ML Engine...");
        
        // Using your actual laptop IP address!
        //const backendUrl = "http://192.168.1.14:5000/predict";
        const backendUrl = "https://young-cats-notice.loca.lt/predict"
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl })
        });

        if (!response.ok) {
          throw new Error(`Python Server Error: ${response.status}`);
        }

        // Parse the JSON data returned by your Flask app
        const mlData = await response.json();

        // Map the Python data to our React Native Report structure
        const newReport = {
          date: new Date().toLocaleDateString(),
          imageId: "img_" + Date.now().toString(), 
          imageUrl: imageUrl || null,
          predictedLesionType: mlData.diagnosis, // Real diagnosis from ensemble!
          modelConfidence: `${(mlData.confidence * 100).toFixed(2)}%`, // Real confidence!
          // Add the Base64 image to the database so we can display it!
          heatmapBase64: mlData.gradcam_image ? `data:image/jpeg;base64,${mlData.gradcam_image}` : null,
          explanation: "Automated analysis completed using HAM10000 ensemble model. Please review the Grad-CAM heatmap for visual feature importance.",
        };

        // Save to Firestore Database securely
        const docRef = await addDoc(userReportsRef, {
          ...newReport,
          createdAt: serverTimestamp(),
        });
        
        console.log("Success: Real ML report saved to Firestore!");

        // Update UI
        setReportData({ ...newReport, reportId: docRef.id });
        setIsAnalyzing(false);
      }catch (error: any) {
        console.error("Failed to process report:", error);
        // Show an actual error pop-up instead of hanging!
        Alert.alert("Analysis Failed", "Could not complete the AI analysis. Please check your Python server terminal.");
        setIsAnalyzing(false);
        router.back(); // Kick them back to the previous screen
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
         <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Report ID (Outside the Card) */}
            <View style={styles.reportIdSection}>
              <Text style={styles.reportIdText}>
                Report ID: <Text style={styles.reportIdValue}>{reportData.reportId}</Text>
              </Text>
            </View>

            {/* Main Report Card */}
            <View style={styles.mainCard}>
              {/* Meta Info */}
              <Text style={styles.metaText}>Date: {reportData.date}</Text>
              <Text style={styles.metaText}>Image ID: {reportData.imageId}</Text>

              {/* Diagnosis Summary Header */}
              <Text style={styles.sectionTitle}>
                Diagnosis Summary
              </Text>

              {/* Results */}
              <Text style={styles.infoText}>
                Predicted lesion type:{" "}
                <Text style={styles.infoValue}>{reportData.predictedLesionType}</Text>
              </Text>
              
              <Text style={styles.infoText}>
                Model Confidence:{" "}
                <Text style={styles.infoValue}>{reportData.modelConfidence}</Text>
              </Text>

              <Text style={styles.infoText}>
                <Text style={styles.infoValue}>Heatmap Visualization: </Text>
                Shows the regions of significance
              </Text>

              {/* Single Large Heatmap Image */}
              <View style={styles.heatmapContainer}>
                <Image
                  // Fallback to original image if heatmap fails to generate
                  source={{ uri: reportData.heatmapBase64 || reportData.imageUrl }}
                  style={styles.heatmapImage}
                  resizeMode="cover"
                />
              </View>

              {/* Explanation Section */}
              <Text style={styles.sectionTitleSmall}>Explanation</Text>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>
                  {reportData.explanation}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
        {/* Bottom Tab Navigation */}
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
    marginBottom: 80, // Leaves room for the bottom tab navigation
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  // --- New Report UI Styles ---
  reportIdSection: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  reportIdText: {
    fontSize: 14,
    color: "#333333",
  },
  reportIdValue: {
    color: "#3B9FE5",
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#3B9FE5",
    borderRadius: 12,
    padding: 16,
  },
  metaText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3B9FE5",
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B9FE5",
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
  },
  infoValue: {
    fontWeight: "bold",
    color: "#3B9FE5",
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
    borderColor: "#000000", // The bold black border from Image 1
  },
  explanationBox: {
    borderWidth: 1.5,
    borderColor: "#3B9FE5",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
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
  // --- New Dual Image Styles ---
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
    aspectRatio: 1, // Forces it to be a perfect square!
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
});
