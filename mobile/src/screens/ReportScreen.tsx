import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createPhotoReport } from "../api/report";

export default function ReportScreen() {
  const [reportType, setReportType] = useState<"cleaning" | "collection">("cleaning");
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!photo) return Alert.alert("Error", "Take or select a photo first");
    setLoading(true);
    setResult(null);
    try {
      const data = await createPhotoReport(reportType, photo, comment || undefined);
      setResult(data);
      if (data.verified_time && data.verified_location) {
        Alert.alert("Approved", "Photo verified successfully");
      } else {
        Alert.alert("Warning", data.verification_error || "Verification failed");
      }
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
      <Text style={styles.title}>Photo Report</Text>

      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, reportType === "cleaning" && styles.segmentActive]}
          onPress={() => setReportType("cleaning")}
        >
          <Ionicons name="water-outline" size={18} color={reportType === "cleaning" ? "#fff" : "#6B7280"} />
          <Text style={[styles.segmentText, reportType === "cleaning" && styles.segmentTextActive]}>Cleaning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, reportType === "collection" && styles.segmentActive]}
          onPress={() => setReportType("collection")}
        >
          <Ionicons name="cash-outline" size={18} color={reportType === "collection" ? "#fff" : "#6B7280"} />
          <Text style={[styles.segmentText, reportType === "collection" && styles.segmentTextActive]}>Collection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoSelector}>
        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={28} color="#4F46E5" />
          <Text style={styles.photoBtnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={28} color="#4F46E5" />
          <Text style={styles.photoBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setPhoto(null)} style={styles.previewWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color="#D1D5DB" />
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.verificationCard}>
          <View style={styles.verRow}>
            <Ionicons name={result.verified_time ? "checkmark-circle" : "close-circle"} size={20} color={result.verified_time ? "#10B981" : "#EF4444"} />
            <Text style={styles.verText}>Time: {result.verified_time ? "Verified" : "Failed"}</Text>
          </View>
          <View style={styles.verRow}>
            <Ionicons name={result.verified_location ? "checkmark-circle" : "close-circle"} size={20} color={result.verified_location ? "#10B981" : "#EF4444"} />
            <Text style={styles.verText}>Location: {result.verified_location ? "Verified" : "Failed"}</Text>
          </View>
          {result.verification_error && (
            <Text style={styles.verError}>{result.verification_error}</Text>
          )}
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Comment (optional)"
        placeholderTextColor="#999"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Report</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F5F3FF" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 20 },
  segment: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 4, marginBottom: 16 },
  segmentBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 10 },
  segmentActive: { backgroundColor: "#4F46E5" },
  segmentText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: "#6B7280" },
  segmentTextActive: { color: "#fff" },
  photoSelector: { flexDirection: "row", gap: 12, marginBottom: 16 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  photoBtnText: { marginLeft: 8, fontSize: 14, color: "#4F46E5", fontWeight: "500" },
  previewWrap: { alignSelf: "center", marginBottom: 16 },
  preview: { width: 220, height: 220, borderRadius: 12 },
  placeholder: { width: 220, height: 220, borderRadius: 12, borderWidth: 2, borderColor: "#D1D5DB", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  placeholderText: { color: "#D1D5DB", marginTop: 8, fontSize: 14 },
  verificationCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#4F46E5" },
  verRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  verText: { marginLeft: 8, fontSize: 14, color: "#374151" },
  verError: { fontSize: 13, color: "#EF4444", marginTop: 4 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: "#E5E7EB", color: "#111827", minHeight: 80, marginBottom: 16, textAlignVertical: "top" },
  submitButton: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
