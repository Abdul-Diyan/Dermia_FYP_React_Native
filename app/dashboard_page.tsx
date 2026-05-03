import BottomTabNavigation from "@/components/bottom-tab-navigation";
import GradientHeader from "@/components/gradient-header";
import { router, useFocusEffect } from "expo-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
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

export default function DashboardPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertVisible, setAlertVisible] = useState(false);

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
        <GradientHeader title="Welcome Back !" isSmallScreen={isSmallScreen} />

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
          {/* Start Diagnosis Button Section */}
          <View style={styles.diagnosisSectionWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.diagnosisButton,
                isSmallScreen && styles.diagnosisButtonSmall,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => setAlertVisible(true)} // <-- Now opens custom modal
            >
              <Text style={[styles.diagnosisButtonText, isSmallScreen && styles.diagnosisButtonTextSmall]}>
                Start Diagnosis
              </Text>
            </Pressable>
          </View>
          {/* </ScrollView> */}

          {/* Custom Alert Modal */}
          <Modal
            visible={isAlertVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setAlertVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.customAlertBox}>
                <Text style={styles.alertTitle}>Start Diagnosis</Text>
                <Text style={styles.alertMessage}>How would you like to provide the image?</Text>

                <View style={styles.alertButtonGroup}>
                  <Pressable
                    style={styles.alertActionBtn}
                    onPress={() => {
                      setAlertVisible(false);
                      router.push({ pathname: "/imagecatalog_page", params: { mode: "select" } });
                    }}
                  >
                    <Text style={styles.alertActionText}>Previous Scan</Text>
                  </Pressable>

                  <Pressable
                    style={styles.alertActionBtn}
                    onPress={() => {
                      setAlertVisible(false);
                      router.push({ pathname: "/imagecatalog_page", params: { mode: "upload" } });
                    }}
                  >
                    <Text style={styles.alertActionText}>Upload New Photo</Text>
                  </Pressable>

                  <Pressable
                    style={styles.alertCancelBtn}
                    onPress={() => setAlertVisible(false)}
                  >
                    <Text style={styles.alertCancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

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

    fontFamily: 'Inter-SemiBold',
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

    fontFamily: 'Inter-SemiBold',
    color: "#4FA0FF", // Lighter blue for the link text
  },
  viewAllLinkSmall: {
    fontSize: 13,
  },
  diagnosisSectionWrapper: {
    marginTop: 80,
    alignItems: "center",
  },
  diagnosisButton: {
    backgroundColor: "#0077FF",
    borderRadius: 9,
    width: 220,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  diagnosisButtonSmall: {
    width: 110,
    height: 60,
  },
  diagnosisButtonText: {
    fontSize: 20,

    fontFamily: 'Inter-Bold',
    // fontWeight: "700",
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

    fontFamily: 'Inter-Regular',
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
  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  customAlertBox: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  alertTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    color: "#000000",
    marginBottom: 10,
  },
  alertMessage: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    color: "#555555",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  alertButtonGroup: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
  },
  alertActionBtn: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
  },
  alertActionText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#007BFF", // iOS style blue link
  },
  alertCancelBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  alertCancelText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#FF3B30", // Red text for cancel
  },
});