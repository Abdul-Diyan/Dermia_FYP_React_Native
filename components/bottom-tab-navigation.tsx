import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface BottomTabNavigationProps {
  isSmallScreen?: boolean;
}

export default function BottomTabNavigation({
  isSmallScreen = false,
}: BottomTabNavigationProps) {
  const pathname = usePathname();

  const handleHistoryPress = () => {
    router.push("/reportcatalog_page");
  };

  const handleHomePress = () => {
    router.push("/dashboard_page");
  };

  const handleProfilePress = () => {
    router.push("/userprofile_page");
  };

  return (
    <LinearGradient
      colors={["#0059BF", "#4A9EFF"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.bottomNav, isSmallScreen && styles.bottomNavSmall]}
    >
      <Pressable style={styles.navItem} onPress={handleHistoryPress}>
        <MaterialCommunityIcons name="chart-box-outline" size={30} color="#FFFFFF" />
      </Pressable>
      <Pressable style={styles.navItem} onPress={handleHomePress}>
        <MaterialCommunityIcons name="home" size={32} color="#FFFFFF" />
      </Pressable>
      <Pressable style={styles.navItem} onPress={handleProfilePress}>
        <MaterialCommunityIcons name="account-outline" size={32} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 49,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomNavSmall: {
    height: 44,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});