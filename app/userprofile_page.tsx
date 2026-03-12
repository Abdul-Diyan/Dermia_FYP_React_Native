import BottomTabNavigation from "@/components/bottom-tab-navigation";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { auth } from "../config/firebaseConfig";

export default function UserProfilePage() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Rohaan Khuram");
  const [email, setEmail] = useState("rohaankhuram@gmail.com");

  // Fetch the user's real email when the page loads
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
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text
          style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
        >
          Profile
        </Text>
        <Pressable
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editIcon}>{isEditing ? "✓" : "✏"}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Avatar */}
        <View
          style={[
            styles.avatarContainer,
            isSmallScreen && styles.avatarContainerSmall,
          ]}
        >
          <View style={[styles.avatar, isSmallScreen && styles.avatarSmall]}>
            <Text
              style={[
                styles.avatarText,
                isSmallScreen && styles.avatarTextSmall,
              ]}
            >
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View
          style={[
            styles.infoContainer,
            isSmallScreen && styles.infoContainerSmall,
          ]}
        >
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Full Name
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text
                style={[
                  styles.displayText,
                  isSmallScreen && styles.displayTextSmall,
                ]}
              >
                {name}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Email
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            ) : (
              <Text
                style={[
                  styles.displayText,
                  isSmallScreen && styles.displayTextSmall,
                ]}
              >
                {email}
              </Text>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            isSmallScreen && styles.logoutButtonSmall,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.logoutButtonText,
              isSmallScreen && styles.logoutButtonTextSmall,
            ]}
          >
            Logout
          </Text>
        </Pressable>
      </ScrollView>

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
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
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
    backgroundColor: "#3B9FE5",
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
    borderColor: "#3B9FE5",
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
