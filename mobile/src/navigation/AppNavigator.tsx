import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ShiftScreen from "../screens/ShiftScreen";
import ReportScreen from "../screens/ReportScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home", History: "calendar", Shift: "briefcase", Report: "camera",
          };
          return (
            <Ionicons
              name={focused ? icons[route.name] : (`${icons[route.name]}-outline` as any)}
              size={22}
              color={focused ? colors.gold : colors.textMuted}
            />
          );
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0d1e",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 6,
          paddingBottom: 10,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Shift" component={ShiftScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
    </Tab.Navigator>
  );
}
