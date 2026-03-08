import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

export default function ReportCatalogPage() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [reports, setReports] = useState([
    { id: 1, title: "Sample Report", date: "2024-01-15" },
    { id: 2, title: "Sample Report", date: "2024-01-10" },
    { id: 3, title: "Sample Report", date: "2024-01-05" },
    { id: 4, title: "Sample Report", date: "2023-12-28" },
  ]);

  const itemsPerRow = 2;
  const itemSize = (width - 80) / itemsPerRow;

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all reports?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: () => {
            setReports([]);
          },
          style: "destructive",
        },
      ],
    );
  };

  const renderReportItem = ({
    item,
    index,
  }: {
    item: { id: number; title: string; date: string };
    index: number;
  }) => (
    <Pressable
      style={[
        styles.reportCard,
        {
          width: itemSize,
          height: itemSize,
        },
        isSmallScreen && styles.reportCardSmall,
      ]}
      onPress={() => console.log("View report:", item.id)}
    >
      <Text
        style={[styles.reportTitle, isSmallScreen && styles.reportTitleSmall]}
      >
        {item.title}
      </Text>
    </Pressable>
  );

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
      >
        {reports.length > 0 ? (
          <View style={styles.gridContainer}>
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={itemsPerRow}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, isSmallScreen && styles.emptyTextSmall]}
            >
              No reports yet
            </Text>
          </View>
        )}
      </ScrollView>

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
  clearButton: {
    width: 100,
    alignItems: "flex-end",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4444",
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
    borderWidth: 3,
    borderColor: "#333333",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reportCardSmall: {
    borderWidth: 2,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
  },
  reportTitleSmall: {
    fontSize: 16,
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
