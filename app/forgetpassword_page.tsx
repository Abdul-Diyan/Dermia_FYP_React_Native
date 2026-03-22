import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebaseConfig";

export default function ForgetPasswordPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;
  const [email, setEmail] = useState("");

  // Dynamic status bar colors
  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Email Sent!",
        "Check your inbox for a link to reset your password.",
      );

      router.push("/login_page");
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Invalid Email",
          "Please enter a properly formatted email address (e.g., name@example.com).",
        );
      } else if (error.code === "auth/user-not-found") {
        Alert.alert(
          "Account Not Found",
          "We couldn't find an account registered with that email.",
        );
      } else {
        // A generic fallback for any other weird errors
        Alert.alert("Failed", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* Header Section with Blue Background */}
        <View style={[styles.headerSection, { minHeight: height * 0.35 }]}>
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Reset Password
          </Text>
          <View style={styles.subtitleContainer}>
            <Text
              style={[
                styles.subtitleText,
                isSmallScreen && styles.subtitleTextSmall,
              ]}
            >
              Forgot password ?
            </Text>
            <Text
              style={[
                styles.subtitleText,
                isSmallScreen && styles.subtitleTextSmall,
              ]}
            >
              We got you
            </Text>
            <Text
              style={[
                styles.subtitleText,
                isSmallScreen && styles.subtitleTextSmall,
              ]}
            >
              covered.
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View
          style={[
            styles.formContainer,
            isSmallScreen && styles.formContainerSmall,
            { width: isSmallScreen ? width * 0.9 : width * 0.85 }, // Keeps form width consistent with other pages
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="rohaan@gmail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Reset Password Button */}
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              isSmallScreen && styles.resetButtonSmall,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleResetPassword}
          >
            <Text
              style={[
                styles.resetButtonText,
                isSmallScreen && styles.resetButtonTextSmall,
              ]}
            >
              Reset Password
            </Text>
          </Pressable>

          {/* Back to Login Link */}
          <View style={styles.backToLoginContainer}>
            <Text
              style={[styles.backText, isSmallScreen && styles.backTextSmall]}
            >
              Remember password?{" "}
            </Text>
            <Pressable onPress={() => router.push("/login_page")}>
              <Text
                style={[styles.backLink, isSmallScreen && styles.backLinkSmall]}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: "#3B9FE5",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40, // Increased to allow the form to overlap cleanly
    width: "100%",
    overflow: "hidden",
  },
  titleText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  titleTextSmall: {
    fontSize: 48,
    marginBottom: 16,
  },
  subtitleContainer: {
    alignItems: "center",
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitleTextSmall: {
    fontSize: 18,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: -40, // Keeps the overlap uniform across all auth pages
    paddingHorizontal: 24,
    paddingVertical: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  formContainerSmall: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: "#3B9FE5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetButtonSmall: {
    paddingVertical: 13,
    marginBottom: 16,
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  resetButtonTextSmall: {
    fontSize: 15,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: "#333333",
  },
  backTextSmall: {
    fontSize: 12,
  },
  backLink: {
    fontSize: 14,
    color: "#3B9FE5",
    fontWeight: "700",
  },
  backLinkSmall: {
    fontSize: 12,
  },
});
