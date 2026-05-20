import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { checkInOut, getTodayStats } from "../api/attendance";
import { useFocusEffect } from "@react-navigation/native";
import { colors, glass, shadows } from "../theme";

export default function HomeScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => { loadStats(); }, [])
  );

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getTodayStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (type: "in" | "out") => {
    setActionLoading(true);
    try {
      await checkInOut(type);
      Alert.alert("Success", `Checked ${type === "in" ? "in" : "out"} at ${new Date().toLocaleTimeString()}`);
      loadStats();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={colors.gold} />
        </View>
      </View>

      <View style={[styles.card, glass, shadows.card]}>
        <Text style={styles.sectionTitle}>Today's Status</Text>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: stats?.checked_in ? colors.success : colors.textMuted }]} />
              <Text style={styles.statusText}>Check-in: {stats?.check_in_time ? new Date(stats.check_in_time).toLocaleTimeString() : "—"}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: stats?.checked_out ? colors.success : colors.textMuted }]} />
              <Text style={styles.statusText}>Check-out: {stats?.check_out_time ? new Date(stats.check_out_time).toLocaleTimeString() : "—"}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, stats?.checked_in && styles.disabled]}
          onPress={() => handleCheck("in")}
          disabled={stats?.checked_in || actionLoading}
        >
          <Ionicons name="log-in-outline" size={28} color={stats?.checked_in ? colors.textMuted : "#0a0815"} />
          <Text style={[styles.actionText, stats?.checked_in && { color: colors.textMuted }]}>Check In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.outButton, stats?.checked_out && styles.disabled]}
          onPress={() => handleCheck("out")}
          disabled={stats?.checked_out || actionLoading}
        >
          <Ionicons name="log-out-outline" size={28} color={stats?.checked_out ? colors.textMuted : "#0a0815"} />
          <Text style={[styles.actionText, stats?.checked_out && { color: colors.textMuted }]}>Check Out</Text>
        </TouchableOpacity>
      </View>

      {actionLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32, marginTop: 16 },
  greeting: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: 0.5 },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: "capitalize" },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" },
  card: { padding: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.gold, marginBottom: 16, letterSpacing: 0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 14 },
  statusText: { fontSize: 15, color: colors.textSecondary },
  actions: { flexDirection: "row", gap: 14 },
  actionButton: {
    flex: 1, backgroundColor: colors.gold, borderRadius: 20, paddingVertical: 28, alignItems: "center",
    ...shadows.glow,
  },
  outButton: { backgroundColor: "rgba(239,68,68,0.9)" },
  disabled: { opacity: 0.3 },
  actionText: { color: "#0a0815", fontSize: 14, fontWeight: "700", marginTop: 10, letterSpacing: 0.5 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center", borderRadius: 24 },
});
