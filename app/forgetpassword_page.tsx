import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
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

export default function ForgetPasswordPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;
  const [email, setEmail] = useState("");

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
        <LinearGradient
          colors={["#4E9BFF", "#2B82FF"]}
          style={[styles.headerSection, { minHeight: height * 0.48 }]} 
        >
          <View style={styles.textContainer}>
            <Text
              style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
            >
              Reset Password
            </Text>
            
            <Text
              style={[
                styles.subtitleText,
                isSmallScreen && styles.subtitleTextSmall,
              ]}
            >
              Forgot password ?{"\n"}
              We got you{"\n"}
              covered.
            </Text>
          </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 80, 
    width: "100%",
    overflow: "hidden",
  },
  textContainer: {
    alignItems: "center", // This centers the text block as a whole
    paddingHorizontal: 20,
  },
  titleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System', 
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 24,
    textAlign: "center",
  },
  titleTextSmall: {
    fontSize: 34,
    marginBottom: 16,
  },
  subtitleText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 20, 
    fontWeight: "600", 
    color: "#FFFFFF",
    letterSpacing: 0.3,
    lineHeight: 28, 
    textAlign: "left", // This left-aligns the text inside its centered block
  },
  subtitleTextSmall: {
    fontSize: 18,
    lineHeight: 26,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: -130,
    paddingHorizontal: 24,
    paddingVertical: 36, 
    minHeight: 300, 
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formContainerSmall: {
    paddingHorizontal: 16,
    paddingVertical: 28,
    marginTop: -60,
    minHeight: 260,
  },
  inputGroup: {
    marginBottom: 32, 
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
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16, 
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonSmall: {
    paddingVertical: 14,
  },
  resetButtonText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resetButtonTextSmall: {
    fontSize: 16,
  },
});