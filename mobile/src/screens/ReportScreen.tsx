import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createPhotoReport } from "../api/report";
import { colors, glass, shadows } from "../theme";

export default function ReportScreen() {
  const [reportType, setReportType] = useState<"cleaning" | "collection">("cleaning");
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow camera access");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) { setPhoto(res.assets[0].uri); setResult(null); }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow gallery access");
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled) { setPhoto(res.assets[0].uri); setResult(null); }
  };

  const handleSubmit = async () => {
    if (!photo) return Alert.alert("Error", "Take or select a photo first");
    setLoading(true);
    try {
      const data = await createPhotoReport(reportType, photo, comment || undefined);
      setResult(data);
      const ok = data.verified_time && data.verified_location;
      Alert.alert(ok ? "Verified" : "Warning", ok ? "Photo approved" : (data.verification_error || "Verification failed"));
      setPhoto(null);
      setComment("");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report</Text>

      <View style={[glass, { padding: 6, flexDirection: "row", marginBottom: 24 }]}>
        {(["cleaning", "collection"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segmentBtn, reportType === t && styles.segmentActive]}
            onPress={() => { setReportType(t); setResult(null); }}
          >
            <Ionicons name={t === "cleaning" ? "water-outline" : "cash-outline"} size={18} color={reportType === t ? "#0a0815" : colors.textMuted} />
            <Text style={[styles.segmentText, reportType === t && styles.segmentTextActive]}>{t === "cleaning" ? "Cleaning" : "Collection"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          <Ionicons name="camera-outline" size={24} color={colors.gold} />
          <Text style={styles.photoBtnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={24} color={colors.gold} />
          <Text style={styles.photoBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.photoArea} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Select photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {result && (
        <View style={[glass, shadows.card, { padding: 20, marginBottom: 20 }]}>
          <Text style={[styles.sectionTitle, { color: result.verified_time && result.verified_location ? colors.success : "#EF4444" }]}>
            {result.verified_time && result.verified_location ? "VERIFIED" : "FAILED"}
          </Text>
          <View style={styles.verRow}>
            <Ionicons name={result.verified_time ? "checkmark-circle" : "close-circle"} size={18} color={result.verified_time ? colors.success : "#EF4444"} />
            <Text style={styles.verText}>Time: {result.verified_time ? "OK" : "Failed"}</Text>
          </View>
          <View style={styles.verRow}>
            <Ionicons name={result.verified_location ? "checkmark-circle" : "close-circle"} size={18} color={result.verified_location ? colors.success : "#EF4444"} />
            <Text style={styles.verText}>Location: {result.verified_location ? "OK" : "Failed"}</Text>
          </View>
          {result.verification_error && <Text style={styles.verError}>{result.verification_error}</Text>}
        </View>
      )}

      <TextInput
        style={[glass, styles.input]}
        placeholder="Comment (optional)"
        placeholderTextColor={colors.textMuted}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#0a0815" /> : <Text style={styles.submitText}>Submit Report</Text>}
      </TouchableOpacity>

      {loading && <View style={styles.overlay}><ActivityIndicator size="large" color={colors.gold} /></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: 14 },
  segmentBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14 },
  segmentActive: { backgroundColor: colors.gold },
  segmentText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: colors.textMuted },
  segmentTextActive: { color: "#0a0815", fontWeight: "700" },
  photoRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  photoBtnText: { marginLeft: 8, fontSize: 14, color: colors.gold, fontWeight: "500" },
  photoArea: { alignSelf: "center", marginBottom: 20 },
  preview: { width: 220, height: 220, borderRadius: 20 },
  placeholder: { width: 220, height: 220, borderRadius: 20, borderWidth: 2, borderColor: colors.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: colors.surface },
  placeholderText: { color: colors.textMuted, marginTop: 8, fontSize: 14 },
  verRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  verText: { marginLeft: 10, fontSize: 14, color: colors.textSecondary },
  verError: { fontSize: 12, color: "#EF4444", marginTop: 4 },
  input: { padding: 16, fontSize: 15, color: colors.text, minHeight: 80, marginBottom: 20, textAlignVertical: "top" },
  submitButton: { backgroundColor: colors.gold, borderRadius: 20, paddingVertical: 18, alignItems: "center", ...shadows.glow },
  submitText: { color: "#0a0815", fontSize: 16, fontWeight: "700" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center" },
});
