import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMonthStats } from "../api/attendance";
import { useFocusEffect } from "@react-navigation/native";
import { colors, glass, shadows } from "../theme";

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => { loadMonth(); }, [])
  );

  const loadMonth = async () => {
    setLoading(true);
    try {
      const items = await getMonthStats();
      setData(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.row, glass]}>
      <View style={styles.dateCol}>
        <Text style={styles.day}>{new Date(item.date).getDate()}</Text>
        <Text style={styles.month}>
          {new Date(item.date).toLocaleDateString("ru-RU", { month: "short" })}
        </Text>
      </View>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{item.check_in ? new Date(item.check_in).toLocaleTimeString() : "—"}</Text>
        <Text style={styles.time}>{item.check_out ? new Date(item.check_out).toLocaleTimeString() : "—"}</Text>
      </View>
      <View style={styles.hoursCol}>
        {item.hours ? (
          <Text style={styles.hours}>{item.hours}h</Text>
        ) : (
          <Ionicons name="remove-outline" size={20} color={colors.textMuted} />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <View style={[styles.header, glass]}>
        <Text style={[styles.headerText, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>In → Out</Text>
        <Text style={[styles.headerText, { flex: 0.7, textAlign: "right" }]}>Hours</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 60, fontSize: 14 }}>
            No data for this month
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 20, marginTop: 16 },
  header: { flexDirection: "row", padding: 16, marginBottom: 12 },
  headerText: { fontSize: 11, fontWeight: "700", color: colors.gold, textTransform: "uppercase", letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", padding: 16 },
  dateCol: { flex: 1, alignItems: "center" },
  day: { fontSize: 20, fontWeight: "700", color: colors.gold },
  month: { fontSize: 11, color: colors.textMuted, textTransform: "uppercase", marginTop: 2 },
  timeCol: { flex: 1.5, gap: 4 },
  time: { fontSize: 14, color: colors.textSecondary },
  hoursCol: { flex: 0.7, alignItems: "flex-end" },
  hours: { fontSize: 16, fontWeight: "700", color: colors.gold },
});
