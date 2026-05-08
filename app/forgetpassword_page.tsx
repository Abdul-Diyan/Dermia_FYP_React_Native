import { LinearGradient } from "expo-linear-gradient";
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
          colors={["#57A6FF", "#006BE6"]}
          style={styles.headerSection}
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
  textContainer: {
    width: "100%",
    marginTop: -40,
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontSize: 40,
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
    fontFamily: "Inter-Regular",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 0.3,
    lineHeight: 28,
    textAlign: "left",
    width: 236,
    marginLeft: 30,
  },
  headerSection: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 395,
    width: "100%",
  },

  subtitleTextSmall: {
    fontSize: 18,
    lineHeight: 26,
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
    marginBottom: 32,
  },
  label: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
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
    color: "#333333",
    width: "100%",
  },
  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  resetButtonSmall: {
    paddingVertical: 14,
  },
  resetButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resetButtonTextSmall: {
    fontSize: 16,
  },
});
