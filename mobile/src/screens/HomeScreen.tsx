import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { checkInOut, getTodayStats } from "../api/attendance";
import { createPhotoReport } from "../api/report";
import { useFocusEffect } from "@react-navigation/native";
import { colors, glass, shadows } from "../theme";

type FlowStep = "check_in" | "cleaning" | "collection" | "check_out";

export default function HomeScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<FlowStep | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

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

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Gallery access is required to select Timestamp Camera photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, exif: true });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleAction = async (step: FlowStep) => {
    setActiveStep(step);
    setVerificationResult(null);
    await pickPhoto();
  };

  const submitPhoto = async () => {
    if (!photo || !activeStep) return;
    setActionLoading(true);
    try {
      let res;
      if (activeStep === "check_in" || activeStep === "check_out") {
        res = await checkInOut(activeStep === "check_in" ? "in" : "out", photo);
      } else {
        res = await createPhotoReport(activeStep, photo);
      }
      setVerificationResult(res);
      setPhoto(null);
      setActiveStep(null);
      loadStats();
    } catch (e: any) {
      const msg = e.response?.data?.detail || "Action failed";
      Alert.alert("Error", typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setActiveStep(null);
    setPhoto(null);
    setVerificationResult(null);
  };

  const statusIcon = (active: boolean) => active ? "checkmark-circle" : "ellipse-outline";
  const statusColor = (active: boolean) => active ? colors.success : colors.textMuted;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>U Stores</Text>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</Text>
        </View>
        <View style={styles.profileBadge}>
          <Ionicons name="person" size={22} color={colors.gold} />
        </View>
      </View>

      <View style={[styles.progressCard, glass, shadows.card]}>
        <Text style={styles.progressTitle}>Today's Progress</Text>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginVertical: 20 }} />
        ) : (
          ["check_in", "cleaning", "collection", "check_out"].map((step) => (
            <View key={step} style={styles.stepRow}>
              <Ionicons name={statusIcon(stats?.[step])} size={20} color={statusColor(stats?.[step])} />
              <Text style={[styles.stepLabel, { color: stats?.[step] ? colors.text : colors.textMuted }]}>
                {step === "check_in" ? "Check In" : step === "cleaning" ? "Cleaning" : step === "collection" ? "Collection" : "Check Out"}
              </Text>
              {stats?.[step] && (
                <Text style={styles.stepTime}>{new Date(stats[step]).toLocaleTimeString()}</Text>
              )}
            </View>
          ))
        )}
      </View>

      {activeStep && photo && (
        <View style={[styles.photoPreviewCard, glass, shadows.card]}>
          <Image source={{ uri: photo }} style={styles.preview} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelAction}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={pickPhoto}>
              <Text style={styles.retakeText}>Change photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {verificationResult && (
        <View style={[styles.verificationCard, glass, shadows.card]}>
          <Ionicons
            name={verificationResult.verified_time ? "checkmark-circle" : "close-circle"}
            size={24}
              color={verificationResult.verified_time ? colors.success : colors.error}
          />
          <Text style={styles.verificationText}>
            {verificationResult.verified_time ? "Photo verified" : verificationResult.verification_error}
          </Text>
        </View>
      )}

      {!activeStep && (
        <View style={styles.actionGrid}>
          {!stats?.checked_in && (
            <TouchableOpacity
              style={[styles.actionCard, glass, shadows.card]}
              onPress={() => handleAction("check_in")}
            >
              <Ionicons name="log-in" size={32} color={colors.gold} />
              <Text style={styles.actionTitle}>Check In</Text>
            </TouchableOpacity>
          )}

          {stats?.checked_in && !stats?.check_out && (
            <>
              <TouchableOpacity
                style={[styles.actionCard, glass, shadows.card]}
                onPress={() => handleAction("cleaning")}
              >
                <Ionicons name="water" size={32} color="#60a5fa" />
                <Text style={styles.actionTitle}>Cleaning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, glass, shadows.card]}
                onPress={() => handleAction("collection")}
              >
                <Ionicons name="cash" size={32} color="#34d399" />
                <Text style={styles.actionTitle}>Collection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, glass, shadows.card]}
                onPress={() => handleAction("check_out")}
              >
                <Ionicons name="log-out" size={32} color="#f87171" />
                <Text style={styles.actionTitle}>Check Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {activeStep && photo && (
        <TouchableOpacity
          style={[styles.submitBtn, shadows.glow]}
          onPress={submitPhoto}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#0a0815" />
          ) : (
            <Text style={styles.submitText}>Submit {activeStep.replace("_", " ")}</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: "capitalize" },
  profileBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" },
  progressCard: { padding: 20, marginBottom: 20, borderRadius: 20 },
  progressTitle: { fontSize: 16, fontWeight: "700", color: colors.gold, marginBottom: 16, letterSpacing: 0.5 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  stepLabel: { fontSize: 15, fontWeight: "500", marginLeft: 12, flex: 1 },
  stepTime: { fontSize: 13, color: colors.textSecondary },
  photoPreviewCard: { padding: 12, marginBottom: 20, borderRadius: 20, alignItems: "center" },
  preview: { width: "100%", height: 280, borderRadius: 16, backgroundColor: colors.surface },
  photoActions: { flexDirection: "row", gap: 16, marginTop: 12 },
  retakeBtn: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  retakeText: { color: colors.gold, fontSize: 14, fontWeight: "600" },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 12, backgroundColor: "transparent", borderWidth: 1, borderColor: colors.error },
  cancelText: { color: colors.error, fontSize: 14, fontWeight: "600" },
  verificationCard: { flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 20, borderRadius: 16, gap: 12 },
  verificationText: { color: colors.textSecondary, fontSize: 14, flex: 1 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, minWidth: "45%", alignItems: "center", padding: 24, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  actionTitle: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 12, letterSpacing: 0.3 },
  submitBtn: { backgroundColor: colors.gold, borderRadius: 20, paddingVertical: 18, alignItems: "center" },
  submitText: { color: "#0a0815", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
});
