import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "landing_page",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, error] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="landing_page" options={{ headerShown: false }} />
        <Stack.Screen name="login_page" options={{ headerShown: false }} />
        <Stack.Screen name="signup_page" options={{ headerShown: false }} />
        <Stack.Screen
          name="forgetpassword_page"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="dashboard_page" options={{ headerShown: false }} />
        <Stack.Screen
          name="imagecatalog_page"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="history_page" options={{ headerShown: false }} />
        <Stack.Screen
          name="userprofile_page"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="reportcatalog_page"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="startdiagnosis_page"
          options={{ headerShown: false }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
