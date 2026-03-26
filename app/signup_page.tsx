import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
        <View style={[styles.headerSection, { minHeight: height * 0.25 }]}>
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Sign up
          </Text>
        </View>

        <View
          style={[
            styles.formContainer,
            isSmallScreen && styles.formContainerSmall,
            { width: isSmallScreen ? width * 0.9 : width * 0.85 }, // Ensures form stays centered and responsive
          ]}
        >
          <Text
            style={[
              styles.subtitleText,
              isSmallScreen && styles.subtitleTextSmall,
            ]}
          >
            Create a new Account
          </Text>

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
              placeholder="••••••••••••••••"
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
              placeholder="••••••••••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

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
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: "#0a73ff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40,
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
    marginTop: -40,
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
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#0a73ff",
    fontWeight: "600",
  },
  forgotPasswordSmall: {
    fontSize: 12,
  },
  signupButton: {
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
  signupButtonSmall: {
    paddingVertical: 13,
    marginBottom: 16,
  },
  signupButtonText: {
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
    fontSize: 14,
    color: "#333333",
  },
  loginTextSmall: {
    fontSize: 12,
  },
  loginLink: {
    fontSize: 14,
    color: "#0a73ff",
    fontWeight: "700",
  },
  loginLinkSmall: {
    fontSize: 12,
  },
});
