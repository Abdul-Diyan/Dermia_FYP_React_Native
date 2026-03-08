import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'landing_page',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="landing_page" options={{ headerShown: false }} />
        <Stack.Screen name="login_page" options={{ headerShown: false }} />
        <Stack.Screen name="signup_page" options={{ headerShown: false }} />
        <Stack.Screen name="forgetpassword_page" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard_page" options={{ headerShown: false }} />
        <Stack.Screen name="imagecatalog_page" options={{ headerShown: false }} />
        <Stack.Screen name="history_page" options={{ headerShown: false }} />
        <Stack.Screen name="userprofile_page" options={{ headerShown: false }} />
        <Stack.Screen name="reportcatalog_page" options={{ headerShown: false }} />
        <Stack.Screen name="startdiagnosis_page" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
