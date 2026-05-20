import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { checkInOut, getTodayStats } from "../api/attendance";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const data = await getTodayStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheck = async (type: "in" | "out") => {
    setLoading(true);
    try {
      await checkInOut(type);
      Alert.alert("Success", `Checked ${type}`);
      loadStats();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome!</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name={stats?.checked_in ? "checkmark-circle" : "time-outline"} size={24} color={stats?.checked_in ? "#10B981" : "#F59E0B"} />
          <Text style={styles.statusText}>
            Check-in: {stats?.check_in_time ? new Date(stats.check_in_time).toLocaleTimeString() : "Not yet"}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name={stats?.checked_out ? "checkmark-circle" : "time-outline"} size={24} color={stats?.checked_out ? "#10B981" : "#F59E0B"} />
          <Text style={styles.statusText}>
            Check-out: {stats?.check_out_time ? new Date(stats.check_out_time).toLocaleTimeString() : "Not yet"}
          </Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.actionButton, stats?.checked_in && styles.disabled]}
          onPress={() => handleCheck("in")}
          disabled={stats?.checked_in || loading}
        >
          <Ionicons name="log-in-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Check In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.outButton, stats?.checked_out && styles.disabled]}
          onPress={() => handleCheck("out")}
          disabled={stats?.checked_out || loading}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Check Out</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4F46E5" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F5F3FF" },
  greeting: { fontSize: 24, fontWeight: "700", color: "#111827" },
  date: { fontSize: 14, color: "#6B7280", marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  statusText: { marginLeft: 12, fontSize: 16, color: "#374151" },
  buttonGroup: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, backgroundColor: "#4F46E5", borderRadius: 12, padding: 20, alignItems: "center" },
  outButton: { backgroundColor: "#EF4444" },
  disabled: { opacity: 0.5 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 8 },
});
