import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ShiftScreen from "../screens/ShiftScreen";
import ReportScreen from "../screens/ReportScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home-outline",
            History: "calendar-outline",
            Shift: "briefcase-outline",
            Report: "camera-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#F3F4F6" },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: "History" }} />
      <Tab.Screen name="Shift" component={ShiftScreen} options={{ tabBarLabel: "Shift" }} />
      <Tab.Screen name="Report" component={ReportScreen} options={{ tabBarLabel: "Report" }} />
    </Tab.Navigator>
  );
}
