import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const LandingPage = () => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section with Blue Background */}
      <View style={[styles.headerSection, { minHeight: height * 0.35 }]}>
        <Text
          style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
        >
          Dermia
        </Text>
      </View>

      {/* Doctors Illustration Section */}
      <View style={[styles.illustrationSection, { height: height * 0.3 }]}>
        <Image
          source={require("@/assets/images/doctors-illustration.png")}
          style={[
            styles.doctorsImage,
            { width: width * 0.7, height: "100%", resizeMode: "contain" },
          ]}
        />
      </View>

      {/* Text Section */}
      <View style={styles.textSection}>
        <Text style={[styles.mainText, isSmallScreen && styles.mainTextSmall]}>
          Smart skin analysis
        </Text>
        <Text style={[styles.subText, isSmallScreen && styles.subTextSmall]}>
          powered by AI
        </Text>
      </View>

      {/* Get Started Button */}
      <View style={styles.buttonSection}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
            isSmallScreen && styles.buttonSmall,
          ]}
          onPress={() => {
            router.push("/login_page");
          }}
        >
          <Text
            style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: "#3B9FE5",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 40,
    paddingBottom: 30,
  },
  titleText: {
    fontSize: 72,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  titleTextSmall: {
    fontSize: 52,
  },
  illustrationSection: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  doctorsImage: {
    aspectRatio: "4/3",
  },
  textSection: {
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  mainText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  mainTextSmall: {
    fontSize: 28,
  },
  subText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  subTextSmall: {
    fontSize: 28,
  },
  buttonSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#3B9FE5",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 280,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonSmall: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 220,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  buttonTextSmall: {
    fontSize: 22,
  },
});

export default LandingPage;
