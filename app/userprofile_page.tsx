import BottomTabNavigation from "@/components/bottom-tab-navigation";
import GradientHeader from "@/components/gradient-header";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
import { auth } from "../config/firebaseConfig";

export default function UserProfilePage() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Rohaan Khuram");
  const [email, setEmail] = useState("rohaankhuram@gmail.com");

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      setEmail(user.email);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      router.push("/landing_page");
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <View style={styles.container}>
        <GradientHeader
          title="User Profile"
          showBackArrow
          isSmallScreen={isSmallScreen}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.linkWrapper}
            onPress={() => router.push("/forgetpassword_page")}
          >
            <Text style={[styles.linkText, styles.resetText]}>
              Reset Password
            </Text>
          </Pressable>

          <Pressable style={styles.linkWrapper} onPress={handleLogout}>
            <Text style={[styles.linkText, styles.logoutText]}>Log out</Text>
          </Pressable>
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
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  linkWrapper: {
    paddingVertical: 15,
    alignSelf: "flex-start",
  },
  linkText: {
    fontSize: 20,

    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.3,
  },
  resetText: {
    color: "#0a73ff",
    marginBottom: 5,
  },
  logoutText: {
    color: "#FF0000",
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
  editButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainerSmall: {
    marginBottom: 24,
    marginTop: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0a73ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarSmall: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarTextSmall: {
    fontSize: 36,
  },
  infoContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
  },
  infoContainerSmall: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#0a73ff",
  },
  inputSmall: {
    paddingVertical: 8,
    fontSize: 12,
  },
  displayText: {
    fontSize: 16,
    color: "#333333",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  displayTextSmall: {
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    paddingVertical: 16,
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
  logoutButtonSmall: {
    paddingVertical: 13,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  logoutButtonTextSmall: {
    fontSize: 15,
  },
});
