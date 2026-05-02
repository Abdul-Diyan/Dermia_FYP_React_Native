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
import { LinearGradient } from "expo-linear-gradient";

export default function LoginPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  const handleLogin = async () => {
    const showAlert = (title: string, message: string) => {
      if (Platform.OS === "web") {
        window.alert(`${title}: \n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    if (!email || !password) {
      showAlert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Logged in:", userCredential.user.email);
      showAlert("Success", "Welcome back!");

      router.push("/dashboard_page");
    } catch (error: any) {
      console.error(error);
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
        {/* Header Section */}
        <LinearGradient
          colors={["#54A3FF", "#0066FF"]} // Vertical gradient matching the screenshot
          style={[styles.headerSection, { minHeight: height * 0.42 }]} // Extended background
        >
          <Text style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}>
            Login
          </Text>
          <Text style={[styles.headerSubtitleText, isSmallScreen && styles.headerSubtitleTextSmall]}>
            Login to existing Account
          </Text>
        </LinearGradient>

        <View
          style={[
            styles.formContainer,
            isSmallScreen && styles.formContainerSmall,
            { width: isSmallScreen ? width * 0.9 : width * 0.85 }, 
          ]}
        >
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

          {/* Options Container (Remember Me Removed, Forgot Password Centered) */}
          {/* Options Container (Remember Me & Forgot Password) */}
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

          <View style={styles.signupContainer}>
            <Text
              style={[
                styles.signupText,
                isSmallScreen && styles.signupTextSmall,
              ]}
            >
              Don't have an account ?{" "}
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
    backgroundColor: "#F8F9FA", // Light grey background behind the card
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerSection: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 60, // Pushes text up slightly from the card
    width: "100%",
    overflow: "hidden",
  },
  titleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System', // Forces standard font
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 16, 
  },
  titleTextSmall: {
    fontSize: 40,
  },
  headerSubtitleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System', 
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginTop: 12, 
  },
    headerSubtitleTextSmall: {
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: -80, // Pulls the white card up over the blue background
    paddingHorizontal: 24,
    paddingVertical: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formContainerSmall: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: -60,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600", // Matches the bold label in SS
    color: "#555555",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System', // Fixes input font
    backgroundColor: "#F7F7F7", 
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
    fontWeight: "500", 
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  optionsContainer: {
    flexDirection: "row", // Changed to row to place items side-by-side
    alignItems: "center", 
    justifyContent: "space-between", // Pushes checkbox left, forgot pass right
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPassword: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 13,
    color: "#007BFF", 
    fontWeight: "700",
  },
  forgotPasswordSmall: {
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: "#007BFF", // Match exact blue of SS button
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loginButtonSmall: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginButtonTextSmall: {
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111", // Darker black from SS
  },
  signupTextSmall: {
    fontSize: 12,
  },
  signupLink: {
    fontSize: 13,
    color: "#007BFF",
    fontWeight: "600",
  },
  signupLinkSmall: {
    fontSize: 12,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#007BFF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007BFF",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  checkboxLabel: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 13,
    color: "#777777",
    fontWeight: "500",
  },
  checkboxLabelSmall: {
    fontSize: 12,
  },

});
