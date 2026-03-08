import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { router, usePathname } from "expo-router";

interface BottomTabNavigationProps {
  isSmallScreen?: boolean;
}

export default function BottomTabNavigation({
  isSmallScreen = false,
}: BottomTabNavigationProps) {
  const pathname = usePathname();

  const handleHistoryPress = () => {
    router.push("history_page");
  };

  const handleHomePress = () => {
    router.push("dashboard_page");
  };

  const handleProfilePress = () => {
    router.push("userprofile_page");
  };

  return (
    <View style={[styles.bottomNav, isSmallScreen && styles.bottomNavSmall]}>
      <Pressable style={styles.navItem} onPress={handleHistoryPress}>
        <Text style={styles.navIcon}>📊</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={handleHomePress}>
        <Text style={styles.navIcon}>🏠</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={handleProfilePress}>
        <Text style={styles.navIcon}>👤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#3B9FE5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomNavSmall: {
    paddingVertical: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  navIcon: {
    fontSize: 28,
  },
});
