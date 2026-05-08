import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface GradientHeaderProps {
  title: string;
  showBackArrow?: boolean;
  isSmallScreen?: boolean;
}

export default function GradientHeader({
  title,
  showBackArrow = false,
  isSmallScreen = false,
}: GradientHeaderProps) {
  return (
    <LinearGradient
      colors={["#4A9EFF", "#0059BF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerSection}
    >
      {showBackArrow ? (
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text
        style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.spacer} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: "hidden",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    width: 40,
  },
  headerText: {
    fontSize: 22,

    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  headerTextSmall: {
    fontSize: 18,
  },
});
