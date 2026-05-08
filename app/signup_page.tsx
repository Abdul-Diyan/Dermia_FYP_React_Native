import { LinearGradient } from "expo-linear-gradient";
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
        <LinearGradient
          colors={["#57A6FF", "#006BE6"]}
          style={styles.headerSection}
        >
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Sign up
          </Text>
          <Text
            style={[
              styles.headerSubtitleText,
              isSmallScreen && styles.headerSubtitleTextSmall,
            ]}
          >
            Create a new Account
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.formInner}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>
                Email
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
                Username
              </Text>
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="rohaan.awan99"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
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

            <View style={styles.loginContainer}>
              <Text
                style={[
                  styles.loginText,
                  isSmallScreen && styles.loginTextSmall,
                ]}
              >
                Already have an account ?{" "}
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
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerSection: {
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 395,
    width: "100%",
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontSize: 48,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  titleTextSmall: {
    fontSize: 40,
  },
  headerSubtitleText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginTop: 20,
  },
  headerSubtitleTextSmall: {
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: 352,
    marginTop: -100,
    paddingVertical: 40,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  formInner: {
    width: 236,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 11,
    marginBottom: 6,
  },
  input: {
    fontFamily: "Inter-Regular",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    width: "100%",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  signupButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 10,
    width: "100%",
  },
  signupButtonSmall: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  signupButtonText: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
  },
  signupButtonTextSmall: {
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 12,

    fontFamily: "Inter-SemiBold",
    color: "#111",
  },
  loginTextSmall: {
    fontSize: 11,
  },
  loginLink: {
    fontSize: 12,
    color: "#007BFF",

    fontFamily: "Inter-SemiBold",
  },
  loginLinkSmall: {
    fontSize: 11,
  },
});
