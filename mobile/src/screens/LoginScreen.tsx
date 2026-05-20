import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendOtp, verifyOtp } from "../api/auth";
import { saveToken, saveUser } from "../store/auth";
import { colors, shadows } from "../theme";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) return Alert.alert("Error", "Enter phone number");
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!code) return Alert.alert("Error", "Enter verification code");
    setLoading(true);
    try {
      const data = await verifyOtp(phone, code, name || undefined);
      await saveToken(data.access_token);
      await saveUser({ id: data.user_id, phone: data.phone, name: data.name, role: data.role });
      onLogin();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.logoWrap}>
        <Ionicons name="shield-checkmark" size={48} color={colors.gold} />
      </View>
      <Text style={styles.title}>Ustores</Text>
      <Text style={styles.subtitle}>
        {step === "phone" ? "Enter your phone to get started" : "Enter verification code"}
      </Text>

      {step === "phone" ? (
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your name (new users)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0815" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0815" /> : <Text style={styles.buttonText}>Verify</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep("phone")}>
            <Text style={styles.link}>Change phone number</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: 32,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.gold,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  form: { gap: 16 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: colors.bg, fontSize: 16, fontWeight: "700" },
  link: { color: colors.gold, textAlign: "center", marginTop: 16, fontSize: 14, opacity: 0.7 },
});
