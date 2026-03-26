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
        <View style={styles.headerSection}>
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            Welcome Back !
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.cardContainer,
              isSmallScreen && styles.cardContainerSmall,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#3B9FE5" />
            ) : (
              <View style={styles.imageGridRow}>
                {recentImages.length > 0 ? (
                  recentImages.map((img) => (
                    <Image
                      key={img.id}
                      source={{ uri: img.url }}
                      style={[
                        styles.liveThumbnail,
                        isSmallScreen && styles.liveThumbnailSmall,
                      ]}
                    />
                  ))
                ) : (
                  <Pressable
                    style={[
                      styles.emptyPlaceholderCard,
                      isSmallScreen && styles.emptyPlaceholderCardSmall,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/imagecatalog_page",
                        params: { mode: "upload" },
                      })
                    }
                  >
                    <Text style={styles.emptyIcon}>📷</Text>
                    <Text style={styles.emptyPromptText}>Add Photo</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/imagecatalog_page",
                  params: { mode: "manage" },
                })
              }
            >
              <Text
                style={[
                  styles.viewAllLink,
                  isSmallScreen && styles.viewAllLinkSmall,
                ]}
              >
                View all
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.cardContainer,
              isSmallScreen && styles.cardContainerSmall,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#3B9FE5" />
            ) : (
              <View style={styles.reportsWrapper}>
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <Pressable
                      key={report.id}
                      style={[
                        styles.reportCard,
                        isSmallScreen && styles.reportCardSmall,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/startdiagnosis_page",
                          params: { imageUrl: report.imageUrl },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.reportText,
                          isSmallScreen && styles.reportTextSmall,
                        ]}
                        numberOfLines={1}
                      >
                        {report.predictedLesionType || "Report"}
                      </Text>
                      <Text style={styles.reportConfidenceText}>
                        {report.modelConfidence
                          ? `Conf: ${report.modelConfidence}`
                          : "View Details"}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Pressable
                    style={[
                      styles.emptyPlaceholderCard,
                      styles.emptyReportCard,
                      isSmallScreen && styles.reportCardSmall,
                    ]}
                  >
                    <Text style={styles.emptyIcon}>🔬</Text>
                    <Text style={styles.emptyPromptText}>No Scans Yet</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Pressable onPress={() => router.push("/reportcatalog_page")}>
              <Text
                style={[
                  styles.viewAllLink,
                  isSmallScreen && styles.viewAllLinkSmall,
                ]}
              >
                View all
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
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
                    {
                      text: "Previous Scan",
                      onPress: () =>
                        router.push({
                          pathname: "/imagecatalog_page",
                          params: { mode: "select" },
                        }),
                    },
                    {
                      text: "Upload New Photo",
                      onPress: () =>
                        router.push({
                          pathname: "/imagecatalog_page",
                          params: { mode: "upload" },
                        }),
                    },
                  ],
                );
              }}
            >
              <Text
                style={[
                  styles.diagnosisButtonText,
                  isSmallScreen && styles.diagnosisButtonTextSmall,
                ]}
              >
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
    backgroundColor: "#F8F8F8",
  },
  headerSection: {
    backgroundColor: "#0a73ff",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerTextSmall: {
    fontSize: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  section: {
    marginTop: 32,
    alignItems: "center",
  },
  sectionSmall: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a73ff",
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#0a73ff",
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  cardContainerSmall: {
    padding: 16,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 140,
    height: 120,
    backgroundColor: "#E8B4B8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B6B6F",
  },
  imagePlaceholderSmall: {
    width: 100,
    height: 90,
  },
  reportsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  reportCard: {
    width: 140,
    height: 120,
    borderWidth: 2,
    borderColor: "#0a73ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
  },
  reportCardSmall: {
    width: 100,
    height: 90,
  },
  reportText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    lineHeight: 24,
  },
  reportTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  viewAllLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a73ff",
  },
  viewAllLinkSmall: {
    fontSize: 13,
  },
  diagnosisButton: {
    backgroundColor: "#0a73ff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "100%", // Helps it stretch naturally
  },
  diagnosisButtonSmall: {
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  diagnosisButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  diagnosisButtonTextSmall: {
    fontSize: 15,
  },
  imageGridRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    marginBottom: 16,
  },
  liveThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  liveThumbnailSmall: {
    width: 65,
    height: 65,
  },
  reportConfidenceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  emptyPlaceholderCard: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#CCC",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  emptyPlaceholderCardSmall: {
    width: 80,
    height: 80,
  },
  emptyReportCard: {
    width: 140,
    height: 120,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyPromptText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textAlign: "center",
  },
});
