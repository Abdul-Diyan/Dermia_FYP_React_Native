import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Platform,
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

export default function LoginPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Dynamic status bar colors
  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  const handleLogin = async () => {
    // Web & Mobile Alert Helper
    const showAlert = (title: string, message: string) => {
      if (Platform.OS === "web") {
        window.alert(`${title}: \n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    // 1. Basic Validation
    if (!email || !password) {
      showAlert("Error", "Please enter both email and password.");
      return;
    }

    // 2. Talk to Firebase
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Logged in:", userCredential.user.email);
      showAlert("Success", "Welcome back!");

      // Navigate to the main dashboard or diagnosis page
      router.push("/dashboard_page");
    } catch (error: any) {
      console.error(error);
      // Give a friendly error message for bad credentials
      if (error.code === "auth/invalid-credential") {
        showAlert("Login Failed", "Incorrect email or password.");
      } else {
        showAlert("Login Failed", error.message);
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
        <View style={[styles.headerSection, { minHeight: height * 0.25 }]}>
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Login
          </Text>
        </View>

        {/* Form Container */}
        <View
          style={[
            styles.formContainer,
            isSmallScreen && styles.formContainerSmall,
            { width: isSmallScreen ? width * 0.9 : width * 0.85 }, // Ensures form stays centered and responsive
          ]}
        >
          {/* Subtitle */}
          <Text
            style={[
              styles.subtitleText,
              isSmallScreen && styles.subtitleTextSmall,
            ]}
          >
            Login to existing Account
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Email or username
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="rohaan@gmail.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Password
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="••••••••••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <Pressable
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  isSmallScreen && styles.checkboxLabelSmall,
                ]}
              >
                remember me
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push("/forgetpassword_page")}>
              <Text
                style={[
                  styles.forgotPassword,
                  isSmallScreen && styles.forgotPasswordSmall,
                ]}
              >
                Forgot password ?
              </Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              isSmallScreen && styles.loginButtonSmall,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleLogin}
          >
            <Text
              style={[
                styles.loginButtonText,
                isSmallScreen && styles.loginButtonTextSmall,
              ]}
            >
              Login
            </Text>
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text
              style={[
                styles.signupText,
                isSmallScreen && styles.signupTextSmall,
              ]}
            >
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/signup_page")}>
              <Text
                style={[
                  styles.signupLink,
                  isSmallScreen && styles.signupLinkSmall,
                ]}
              >
                Sign up
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
    alignItems: "center", // Keeps the header and form horizontally centered
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: "#0a73ff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40, // Added more padding so the form overlaps nicely
    width: "100%",
    overflow: "hidden",
  },
  titleText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  titleTextSmall: {
    fontSize: 48,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: -40, // Overlaps the form slightly over the blue header
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
  subtitleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 24,
    textAlign: "center",
  },
  subtitleTextSmall: {
    fontSize: 16,
    marginBottom: 16,
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 12,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#0a73ff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0a73ff",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#999999",
    // Make sure the label doesn't push the forgot password text out on small screens
    maxWidth: 100,
  },
  checkboxLabelSmall: {
    fontSize: 12,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#0a73ff",
    fontWeight: "600",
  },
  forgotPasswordSmall: {
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: "#0a73ff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonSmall: {
    paddingVertical: 13,
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loginButtonTextSmall: {
    fontSize: 15,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#333333",
  },
  signupTextSmall: {
    fontSize: 12,
  },
  signupLink: {
    fontSize: 14,
    color: "#0a73ff",
    fontWeight: "700",
  },
  signupLinkSmall: {
    fontSize: 12,
  },
});
