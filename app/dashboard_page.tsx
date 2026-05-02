import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router, useFocusEffect } from "expo-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const imagesRef = collection(db, "users", user.uid, "images");
          const qImages = query(
            imagesRef,
            orderBy("createdAt", "desc"),
            limit(3),
          );
          const imageSnap = await getDocs(qImages);

          const fetchedImages: any[] = [];
          imageSnap.forEach((doc) =>
            fetchedImages.push({ id: doc.id, ...doc.data() }),
          );
          setRecentImages(fetchedImages);

          const reportsRef = collection(db, "users", user.uid, "reports");
          const qReports = query(
            reportsRef,
            orderBy("createdAt", "desc"),
            limit(2),
          );
          const reportSnap = await getDocs(qReports);

          const fetchedReports: any[] = [];
          reportSnap.forEach((doc) =>
            fetchedReports.push({ id: doc.id, ...doc.data() }),
          );
          setRecentReports(fetchedReports);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }, []),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <View style={styles.container}>
        {/* Header Section */}
        <LinearGradient
          colors={["#3b94ff", "#004dcc"]} // Light left, dark right
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.headerSection}
        >
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            Welcome Back !
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Browse Images Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleHeader}>Browse Images</Text>
            <View style={[styles.cardContainer, isSmallScreen && styles.cardContainerSmall]}>
              <View style={styles.cardContentRow}>
                {isLoading ? (
                  <ActivityIndicator color="#007BFF" />
                ) : recentImages.length > 0 ? (
                  recentImages.map((img) => (
                    <Image
                      key={img.id}
                      source={{ uri: img.url }}
                      style={[styles.liveThumbnail, isSmallScreen && styles.liveThumbnailSmall]}
                    />
                  ))
                ) : (
                  <Pressable
                    style={[styles.emptyPlaceholderCard, isSmallScreen && styles.emptyPlaceholderCardSmall]}
                    onPress={() => router.push({ pathname: "/imagecatalog_page", params: { mode: "upload" } })}
                  >
                    <Text style={styles.emptyIcon}>📷</Text>
                    <Text style={styles.emptyPromptText}>Add Photo</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.viewAllContainer}>
                <Pressable onPress={() => router.push({ pathname: "/imagecatalog_page", params: { mode: "manage" } })}>
                  <Text style={[styles.viewAllLink, isSmallScreen && styles.viewAllLinkSmall]}>
                    View all
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Previous Report History Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleHeader}>Previous report history</Text>
            <View style={[styles.cardContainer, isSmallScreen && styles.cardContainerSmall]}>
              <View style={styles.cardContentRow}>
                {isLoading ? (
                  <ActivityIndicator color="#007BFF" />
                ) : recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <Pressable
                      key={report.id}
                      style={[styles.reportCard, isSmallScreen && styles.reportCardSmall]}
                      onPress={() => router.push({ pathname: "/startdiagnosis_page", params: { imageUrl: report.imageUrl } })}
                    >
                      <Text style={[styles.reportText, isSmallScreen && styles.reportTextSmall]} numberOfLines={1}>
                        {report.predictedLesionType || "Sample Report"}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Pressable style={[styles.emptyPlaceholderCard, styles.emptyReportCard, isSmallScreen && styles.reportCardSmall]}>
                    <Text style={styles.emptyIcon}>🔬</Text>
                    <Text style={styles.emptyPromptText}>No Scans</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.viewAllContainer}>
                <Pressable onPress={() => router.push("/reportcatalog_page")}>
                  <Text style={[styles.viewAllLink, isSmallScreen && styles.viewAllLinkSmall]}>
                    View all
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Start Diagnosis Button Section */}
          <View style={styles.diagnosisSectionWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.diagnosisButton,
                isSmallScreen && styles.diagnosisButtonSmall,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => {
                Alert.alert(
                  "Start Diagnosis",
                  "How would you like to provide the image?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Previous Scan", onPress: () => router.push({ pathname: "/imagecatalog_page", params: { mode: "select" } }) },
                    { text: "Upload New Photo", onPress: () => router.push({ pathname: "/imagecatalog_page", params: { mode: "upload" } }) },
                  ]
                );
              }}
            >
              <Text style={[styles.diagnosisButtonText, isSmallScreen && styles.diagnosisButtonTextSmall]}>
                Start Diagnosis
              </Text>
            </Pressable>
          </View>
        </ScrollView>

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
    backgroundColor: "#FFFFFF", // Changed to pure white to match screenshot
  },
  headerSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    // Background color removed as it's now handled by LinearGradient
  },
  headerText: {
    fontSize: 22, // Adjusted size to match SS
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerTextSmall: {
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30, // Pushes content down a bit from header
    paddingBottom: 100,
  },
  sectionContainer: {
    marginBottom: 40, // Perfects the gap between Catalog and Reports
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066FF", // Exact blue from the screenshot text
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: "#F8FAFD", // Very faint blue/gray background
    borderRadius: 8, // Less rounded, matches SS
    borderWidth: 1, // Thinner border
    borderColor: "#A3C8FA", // Light blue border
    padding: 16,
    minHeight: 130, // Ensures room for 'View all' at bottom
    justifyContent: "space-between", // Pushes content top, 'View all' bottom
  },
  cardContainerSmall: {
    padding: 12,
    minHeight: 110,
  },
  cardContentRow: {
    flexDirection: "row",
    justifyContent: "flex-start", // Aligns images/reports to the left
    gap: 12,
    width: "100%",
  },
  viewAllContainer: {
    alignItems: "flex-end", // Aligns "View all" to bottom right
    marginTop: 10,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4FA0FF", // Lighter blue for the link text
  },
  viewAllLinkSmall: {
    fontSize: 13,
  },
  diagnosisSectionWrapper: {
    marginTop: 100, // Increased significantly to push the button lower
    alignItems: "center", 
  },
  diagnosisButton: {
    backgroundColor: "#007BFF", 
    borderRadius: 8, 
    paddingVertical: 14, // Slightly thinner vertically
    alignItems: "center",
    justifyContent: "center",
    width: 200, // Reduced width to match the screenshot proportions
  },
  diagnosisButtonSmall: {
    paddingVertical: 14,
    width: 180,
  },
  diagnosisButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  diagnosisButtonTextSmall: {
    fontSize: 15,
  },
  liveThumbnail: {
    width: 100, // Slightly wider thumbnail to match SS
    height: 70,
    borderRadius: 4, // Less rounded thumbnail
    borderWidth: 1,
    borderColor: "#007BFF", // Adding blue border around image
  },
  liveThumbnailSmall: {
    width: 80,
    height: 60,
  },
  reportCard: {
    width: 100, // Matches SS proportion
    height: 80,
    borderWidth: 1,
    borderColor: "#4FA0FF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White interior for report cards
  },
  reportCardSmall: {
    width: 85,
    height: 70,
  },
  reportText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555", // Dark grey text inside report card
    textAlign: "center",
  },
  reportTextSmall: {
    fontSize: 12,
  },
  emptyPlaceholderCard: {
    width: 100,
    height: 70,
    borderWidth: 1,
    borderColor: "#CCC",
    borderStyle: "dashed",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  emptyPlaceholderCardSmall: {
    width: 80,
    height: 60,
  },
  emptyReportCard: {
    width: 100,
    height: 80,
  },
  emptyIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  emptyPromptText: {
    fontSize: 11,
    color: "#999",
  },
});