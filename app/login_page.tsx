import { LinearGradient } from "expo-linear-gradient";
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
  const { width } = useWindowDimensions();
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
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#57A6FF", "#006BE6"]}
          style={styles.headerSection}
        >
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Login
          </Text>
          <Text
            style={[
              styles.headerSubtitleText,
              isSmallScreen && styles.headerSubtitleTextSmall,
            ]}
          >
            Login to existing Account
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.formInner}>
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

            <View style={styles.optionsContainer}>
              <Pressable
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
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
    fontFamily: "Inter-Regular",
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
    fontFamily: "Inter-SemiBold",
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
    width: "100%",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPassword: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: "#007BFF",
  },
  forgotPasswordSmall: {
    fontSize: 11,
  },
  loginButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  loginButtonSmall: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
  },
  loginButtonTextSmall: {
    fontSize: 20,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 12,

    fontFamily: "Inter-SemiBold",
    color: "#111",
  },
  signupTextSmall: {
    fontSize: 11,
  },
  signupLink: {
    fontSize: 12,
    color: "#007BFF",

    fontFamily: "Inter-SemiBold",
  },
  signupLinkSmall: {
    fontSize: 11,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
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
    fontSize: 10,
  },
  checkboxLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#777777",
  },
  checkboxLabelSmall: {
    fontSize: 11,
  },
});
