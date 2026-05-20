import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { getToken } from "./src/store/auth";
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

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isLoggedIn ? <AppNavigator /> : <LoginScreen onLogin={() => setIsLoggedIn(true)} />}
    </NavigationContainer>
  );
}
