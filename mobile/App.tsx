import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { getToken } from "./src/store/auth";
import { colors } from "./src/theme";
import LoginScreen from "./src/screens/LoginScreen";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {isLoggedIn ? <AppNavigator /> : <LoginScreen onLogin={() => setIsLoggedIn(true)} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
