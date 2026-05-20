import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { shiftAction, getTodayShift } from "../api/shift";
import { useFocusEffect } from "@react-navigation/native";

export default function ShiftScreen() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadToday();
    }, [])
  );

  const loadToday = async () => {
    try {
      const data = await getTodayShift();
      setShifts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
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
    <View style={styles.container}>
      <Text style={styles.title}>Shift Management</Text>

      {shifts.length > 0 && (
        <View style={styles.history}>
          {shifts.map((s) => (
            <View key={s.id} style={styles.historyItem}>
              <Ionicons name={s.action === "open" ? "sunny-outline" : "moon-outline"} size={20} color="#4F46E5" />
              <Text style={styles.historyText}>
                {s.action === "open" ? "Opened" : "Closed"} at {new Date(s.time).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.preview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
            <Text style={styles.photoText}>Take Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.actionButton, hasOpen && styles.disabled]}
          onPress={() => handleAction("open")}
          disabled={hasOpen || loading}
        >
          <Ionicons name="sunny-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Open Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.closeButton, hasClose && styles.disabled]}
          onPress={() => handleAction("close")}
          disabled={hasClose || loading}
        >
          <Ionicons name="moon-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Close Shift</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4F46E5" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F5F3FF" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 20 },
  history: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20 },
  historyItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  historyText: { marginLeft: 8, fontSize: 14, color: "#374151" },
  photoButton: { alignSelf: "center", marginBottom: 24 },
  preview: { width: 200, height: 200, borderRadius: 12 },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  photoText: { color: "#9CA3AF", marginTop: 8, fontSize: 14 },
  buttonGroup: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, backgroundColor: "#4F46E5", borderRadius: 12, padding: 20, alignItems: "center" },
  closeButton: { backgroundColor: "#EF4444" },
  disabled: { opacity: 0.5 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 8 },
});
