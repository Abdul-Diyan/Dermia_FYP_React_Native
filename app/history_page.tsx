import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router } from "expo-router";
import React from "react";
import {
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

export default function HistoryPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  const historyItems = [
    { id: 1, date: "2024-01-15", condition: "Acne", severity: "Moderate" },
    { id: 2, date: "2024-01-10", condition: "Eczema", severity: "Mild" },
    { id: 3, date: "2024-01-05", condition: "Psoriasis", severity: "Severe" },
    {
      id: 4,
      date: "2023-12-28",
      condition: "Dermatitis",
      severity: "Moderate",
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            History
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {historyItems.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.historyCard,
                isSmallScreen && styles.historyCardSmall,
              ]}
              onPress={() => console.log("View history item:", item.id)}
            >
              <View style={styles.historyCardContent}>
                <Text
                  style={[
                    styles.historyDate,
                    isSmallScreen && styles.historyDateSmall,
                  ]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[
                    styles.historyCondition,
                    isSmallScreen && styles.historyConditionSmall,
                  ]}
                >
                  {item.condition}
                </Text>
                <Text
                  style={[
                    styles.historySeverity,
                    isSmallScreen && styles.historySeveritySmall,
                  ]}
                >
                  Severity: {item.severity}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </Pressable>
          ))}
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
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  historyCardSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  historyCardContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  historyDateSmall: {
    fontSize: 10,
  },
  historyCondition: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 6,
  },
  historyConditionSmall: {
    fontSize: 16,
  },
  historySeverity: {
    fontSize: 14,
    color: "#0a73ff",
    fontWeight: "600",
  },
  historySeveritySmall: {
    fontSize: 12,
  },
  arrowIcon: {
    fontSize: 20,
    color: "#0a73ff",
    marginLeft: 12,
    fontWeight: "600",
  },
});
