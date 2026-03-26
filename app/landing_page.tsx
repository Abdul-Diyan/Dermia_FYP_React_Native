import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LandingPage = () => {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const isSmallScreen = width < 400;

  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

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
        <View
          style={[
            styles.headerSection,
            {
              minHeight: height * 0.35,
              width: "100%",
            },
          ]}
        >
          <Text
            style={[styles.titleText, isSmallScreen && styles.titleTextSmall]}
          >
            Dermia
          </Text>
        </View>

        <View style={styles.bodySection}>
          <View style={[styles.illustrationSection, { height: height * 0.3 }]}>
            <Image
              source={require("@/assets/images/doctors-illustration.png")}
              style={[
                styles.doctorsImage,
                { width: width * 0.75, height: "100%", resizeMode: "contain" },
              ]}
            />
          </View>

          <View style={styles.textSection}>
            <Text
              style={[styles.mainText, isSmallScreen && styles.mainTextSmall]}
            >
              Smart skin analysis
            </Text>
            <Text
              style={[styles.subText, isSmallScreen && styles.subTextSmall]}
            >
              powered by AI
            </Text>
          </View>

          <View style={styles.buttonSection}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.8 : 1 },
                isSmallScreen && styles.buttonSmall,
                { maxWidth: width * 0.85 },
              ]}
              onPress={() => {
                router.push("/login_page");
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  isSmallScreen && styles.buttonTextSmall,
                ]}
              >
                Get Started
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  },
  headerSection: {
    backgroundColor: "#0a73ff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 20,
    overflow: "hidden",
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
  bodySection: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingVertical: 20,
    width: "100%",
  },
  illustrationSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  doctorsImage: {
    aspectRatio: "4/3",
  },
  textSection: {
    alignItems: "center",
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
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#0a73ff",
    paddingVertical: 18,
    paddingHorizontal: 40,
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
    paddingHorizontal: 30,
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
