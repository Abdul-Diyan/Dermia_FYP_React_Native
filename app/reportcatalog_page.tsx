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
import { LinearGradient } from "expo-linear-gradient";

export default function ReportCatalogPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerRow = 2;
  const itemSize = (width - 80) / itemsPerRow;

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

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
              setReports([]);
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
        { width: itemSize, height: itemSize + 40 },
        isSmallScreen && styles.reportCardSmall,
      ]}
      onPress={() => {
        router.push({
          pathname: "/startdiagnosis_page",
          params: { imageUrl: item.imageUrl },
        });
      }}
    >
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
        
        <LinearGradient
         
          colors={["#3b94ff", "#004dcc"]}  // Updated to app standard gradient
          start={{ x: 0, y: 0.5 }}
  end={{ x: 1, y: 0.5 }}
          style={styles.headerSection}
        >
          {/* LEFT SIDE: 100px wide container to balance the right side */}
          <View style={styles.headerSideContainer}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          </View>

          {/* MIDDLE: Text perfectly centered */}
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            Report History
          </Text>

          {/* RIGHT SIDE: 100px wide container for the Clear button */}
          <View style={[styles.headerSideContainer, { alignItems: 'flex-end' }]}>
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
        </LinearGradient>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007BFF" // Updated loader color
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  headerSideContainer: {
    width: 100, // Locks both sides to 100px so the middle is dead-center
    justifyContent: 'center',
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "flex-start", // Push icon to the left edge of the container
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
    paddingVertical: 10,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "700", // Made slightly bolder
    color: "#FF8888", // Lightened red so it passes contrast checks on blue
  },
  clearButtonTextSmall: {
    fontSize: 12,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
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
    borderColor: "#007BFF", // Match unified app blue
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
    height: "60%",
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