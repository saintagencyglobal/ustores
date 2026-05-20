import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { shiftAction, getTodayShift } from "../api/shift";
import { useFocusEffect } from "@react-navigation/native";
import { colors, glass, shadows } from "../theme";

export default function ShiftScreen() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => { loadToday(); }, [])
  );

  const loadToday = async () => {
    try {
      const data = await getTodayShift();
      setShifts(data);
    } catch (e) { console.error(e); }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleAction = async (action: "open" | "close") => {
    if (!photo) return Alert.alert("Error", "Take a photo first");
    setLoading(true);
    try {
      await shiftAction(action, photo);
      Alert.alert("Success", `Shift ${action}ed`);
      setPhoto(null);
      loadToday();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const hasOpen = shifts.some((s) => s.action === "open");
  const hasClose = shifts.some((s) => s.action === "close");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shift</Text>

      {shifts.length > 0 && (
        <View style={[glass, shadows.card, { padding: 20, marginBottom: 24 }]}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          {shifts.map((s) => (
            <View key={s.id} style={styles.historyItem}>
              <View style={[styles.iconBox, { backgroundColor: s.action === "open" ? "rgba(212,168,83,0.15)" : "rgba(239,68,68,0.15)" }]}>
                <Ionicons name={s.action === "open" ? "sunny-outline" : "moon-outline"} size={20} color={s.action === "open" ? colors.gold : "#EF4444"} />
              </View>
              <Text style={styles.historyText}>
                {s.action === "open" ? "Opened" : "Closed"} — {new Date(s.time).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Photo Required</Text>
      <TouchableOpacity style={styles.photoArea} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={52} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Tap to take photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.gold }, hasOpen && styles.disabled]}
          onPress={() => handleAction("open")}
          disabled={hasOpen || loading}
        >
          <Ionicons name="sunny-outline" size={24} color="#0a0815" />
          <Text style={styles.actionText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#EF4444" }, hasClose && styles.disabled]}
          onPress={() => handleAction("close")}
          disabled={hasClose || loading}
        >
          <Ionicons name="moon-outline" size={24} color="#fff" />
          <Text style={[styles.actionText, { color: "#fff" }]}>Close</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gold, marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" },
  historyItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  historyText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  photoArea: { alignSelf: "center", marginBottom: 28 },
  preview: { width: 220, height: 220, borderRadius: 20 },
  placeholder: {
    width: 220, height: 220, borderRadius: 20, borderWidth: 2, borderColor: colors.border,
    borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: colors.surface,
  },
  placeholderText: { color: colors.textMuted, marginTop: 12, fontSize: 14 },
  actions: { flexDirection: "row", gap: 14 },
  actionBtn: { flex: 1, borderRadius: 20, paddingVertical: 22, alignItems: "center", ...shadows.glow },
  disabled: { opacity: 0.3 },
  actionText: { color: "#0a0815", fontSize: 15, fontWeight: "700", marginTop: 8 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center" },
});
