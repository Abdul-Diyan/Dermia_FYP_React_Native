import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

export default function DashboardPage() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text
          style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
        >
          Welcome Back !
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Browse Images Section */}
        <View style={[styles.section, isSmallScreen && styles.sectionSmall]}>
          <Text
            style={[
              styles.sectionTitle,
              isSmallScreen && styles.sectionTitleSmall,
            ]}
          >
            Browse Images
          </Text>
          <View
            style={[
              styles.cardContainer,
              isSmallScreen && styles.cardContainerSmall,
            ]}
          >
            <View style={styles.imageWrapper}>
              <View
                style={[
                  styles.imagePlaceholder,
                  isSmallScreen && styles.imagePlaceholderSmall,
                ]}
              />
            </View>
            <Pressable onPress={() => router.push("/imagecatalog_page")}>
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
        </View>

        {/* Previous Report History Section */}
        <View style={[styles.section, isSmallScreen && styles.sectionSmall]}>
          <Text
            style={[
              styles.sectionTitle,
              isSmallScreen && styles.sectionTitleSmall,
            ]}
          >
            Previous report history
          </Text>
          <View
            style={[
              styles.cardContainer,
              isSmallScreen && styles.cardContainerSmall,
            ]}
          >
            <View style={styles.reportsWrapper}>
              <View
                style={[
                  styles.reportCard,
                  isSmallScreen && styles.reportCardSmall,
                ]}
              >
                <Text
                  style={[
                    styles.reportText,
                    isSmallScreen && styles.reportTextSmall,
                  ]}
                >
                  Sample{"\n"}Report
                </Text>
              </View>
              <View
                style={[
                  styles.reportCard,
                  isSmallScreen && styles.reportCardSmall,
                ]}
              >
                <Text
                  style={[
                    styles.reportText,
                    isSmallScreen && styles.reportTextSmall,
                  ]}
                >
                  Sample{"\n"}Report
                </Text>
              </View>
            </View>
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
        </View>

        {/* Start Diagnosis Button */}
        <Pressable
          style={({ pressed }) => [
            styles.diagnosisButton,
            isSmallScreen && styles.diagnosisButtonSmall,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => router.push("/imagecatalog_page")}
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
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <BottomTabNavigation isSmallScreen={isSmallScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerSection: {
    backgroundColor: "#3B9FE5",
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
    marginBottom: 32,
  },
  sectionSmall: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B9FE5",
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
    borderColor: "#3B9FE5",
    padding: 20,
    alignItems: "center",
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
    borderColor: "#3B9FE5",
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
    color: "#3B9FE5",
  },
  viewAllLinkSmall: {
    fontSize: 13,
  },
  diagnosisButton: {
    backgroundColor: "#3B9FE5",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diagnosisButtonSmall: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 24,
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
});
