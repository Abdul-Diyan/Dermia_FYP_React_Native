import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
import { LinearGradient } from "expo-linear-gradient"; // Use LinearGradient as requested

export default function SignupPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Registered:", userCredential.user.email);
      Alert.alert("Success!", "Account created successfully.");

      router.push("/login_page");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Signup Failed", error.message);
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
        <LinearGradient
          colors={["#4DA1FF", "#0066FF"]} // Match the gradient in image_3.png
          style={[styles.headerSection, { minHeight: height * 0.48 }]} // Elongated to match forgot password page length
        >
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Sign up
          </Text>
          
          {/* Moved the 'Create new Account' text out of the card and made it white */}
          <Text
            style={[styles.headerSubtitleText, isSmallScreen && styles.headerSubtitleTextSmall]}
          >
            Create a new Account
          </Text>
        </LinearGradient>

        <View
          style={[
            styles.formContainer,
            isSmallScreen && styles.formContainerSmall,
            { width: isSmallScreen ? width * 0.9 : width * 0.85 }, // Center and responsive width
          ]}
        >
          {/* Removed internal 'Create a new Account' text from here */}
          
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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Username
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="rohaan.awan99"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Password
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="••••••••••••••••" // Match image with bullets
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
              Confirm Password
            </Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              placeholder="••••••••••••••••" // Match image with bullets
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          
          {/* Note: Internal 'Forgot password?' is ignored as per instructions */}

          <View style={{ marginTop: 12 }}>
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                isSmallScreen && styles.signupButtonSmall,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={handleSignup}
            >
              <Text
                style={[
                  styles.signupButtonText,
                  isSmallScreen && styles.signupButtonTextSmall,
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>

          <View style={styles.loginContainer}>
            <Text
              style={[styles.loginText, isSmallScreen && styles.loginTextSmall]}
            >
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/login_page")}>
              <Text
                style={[
                  styles.loginLink,
                  isSmallScreen && styles.loginLinkSmall,
                ]}
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
    backgroundColor: "#F8F9FA", // Use a light gray to match the shadow depth in image_3.png
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerSection: {
    // Gradient is applied directly via LinearGradient
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 80, // Allow space for the subtitle above the card
    width: "100%",
    overflow: "hidden",
  },
  titleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 56, // Match target image size
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 24, // Space between title and subtitle
    textAlign: "center",
  },
  titleTextSmall: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerSubtitleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 22, // Match target image size
    fontWeight: "600",
    color: "#FFFFFF", // White text above the card
    letterSpacing: 0.5,
    textAlign: "center",
  },
  headerSubtitleTextSmall: {
    fontSize: 18,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: -130, // Deeper overlap to match elongated header
    paddingHorizontal: 24,
    paddingVertical: 36, // Match shadow depth and padding in image_3.png
    minHeight: 380, // Provide ample space for inputs
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  formContainerSmall: {
    paddingHorizontal: 16,
    paddingVertical: 28,
    minHeight: 340,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    backgroundColor: "#F7F7F7", // Match the lighter grey input background
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333333",
    borderWidth: 0, // Borderless inputs like target image
    fontWeight: "500",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  signupButton: {
    backgroundColor: "#007BFF", // Match exact button blue
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonSmall: {
    paddingVertical: 13,
    marginBottom: 16,
    marginTop: 8,
  },
  signupButtonText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  signupButtonTextSmall: {
    fontSize: 15,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  loginTextSmall: {
    fontSize: 12,
  },
  loginLink: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 14,
    color: "#007BFF", // Match blue link color
    fontWeight: "700",
  },
  loginLinkSmall: {
    fontSize: 12,
  },
});