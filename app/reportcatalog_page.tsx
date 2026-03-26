import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

export default function ReportCatalogPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerRow = 2;
  const itemSize = (width - 80) / itemsPerRow;

  // Dynamic status bar colors
  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch only the 5 most recent reports!
        const reportsRef = collection(db, "users", user.uid, "reports");
        const q = query(reportsRef, orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);

        const fetchedReports: any[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });

        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete these reports?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              // Batch delete from Firestore
              const batch = writeBatch(db);
              reports.forEach((report) => {
                const reportRef = doc(
                  db,
                  "users",
                  user.uid,
                  "reports",
                  report.id,
                );
                batch.delete(reportRef);
              });

              await batch.commit();
              setReports([]); // Clear UI
              Alert.alert("Success", "History cleared.");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Could not clear history.");
            }
          },
        },
      ],
    );
  };

  const renderReportItem = ({ item }: { item: any }) => (
    <Pressable
      style={[
        styles.reportCard,
        { width: itemSize, height: itemSize + 40 }, // Added height for the image
        isSmallScreen && styles.reportCardSmall,
      ]}
      onPress={() => {
        // Route to diagnosis page and pass image URL to trigger the smart cache!
        router.push({
          pathname: "/startdiagnosis_page",
          params: { imageUrl: item.imageUrl },
        });
      }}
    >
      {/* Show the actual skin lesion image thumbnail */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: "#E8B4B8" }]} />
      )}

      <Text
        style={[styles.reportTitle, isSmallScreen && styles.reportTitleSmall]}
        numberOfLines={1}
      >
        {item.predictedLesionType || "Report"}
      </Text>
      <Text style={styles.reportDate}>{item.date}</Text>
    </Pressable>
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
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            Report History
          </Text>
          <Pressable style={styles.clearButton} onPress={handleClearHistory}>
            <Text
              style={[
                styles.clearButtonText,
                isSmallScreen && styles.clearButtonTextSmall,
              ]}
            >
              Clear History
            </Text>
          </Pressable>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#3B9FE5"
              style={{ marginTop: 50 }}
            />
          ) : reports.length > 0 ? (
            <View style={styles.gridContainer}>
              <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item.id}
                numColumns={itemsPerRow}
                scrollEnabled={false}
                columnWrapperStyle={styles.columnWrapper}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  isSmallScreen && styles.emptyTextSmall,
                ]}
              >
                No reports yet
              </Text>
            </View>
          )}
        </ScrollView>

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
  clearButton: {
    width: 100, // Kept fixed width so headerText stays perfectly centered
    alignItems: "flex-end",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4444", // Assuming red for clear history
  },
  clearButtonTextSmall: {
    fontSize: 12,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80, // Leaves room for the absolute BottomTabNavigation
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  gridContainer: {
    width: "100%",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#0a73ff",
    borderRadius: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    overflow: "hidden",
  },
  reportCardSmall: {
    borderWidth: 2,
  },
  cardImage: {
    width: "100%",
    height: "60%", // Take up the top portion of the card
    borderRadius: 8,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },
  reportTitleSmall: {
    fontSize: 14,
  },
  reportDate: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999999",
    fontWeight: "600",
  },
  emptyTextSmall: {
    fontSize: 14,
  },
});
