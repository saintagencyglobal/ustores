import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { getMonthStats } from "../api/attendance";
import { useFocusEffect } from "@react-navigation/native";

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadMonth();
    }, [])
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
    <View style={styles.row}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.time}>{item.check_in ? new Date(item.check_in).toLocaleTimeString() : "-"}</Text>
      <Text style={styles.time}>{item.check_out ? new Date(item.check_out).toLocaleTimeString() : "-"}</Text>
      <Text style={styles.hours}>{item.hours ? `${item.hours}h` : "-"}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4F46E5" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month</Text>
      <View style={styles.header}>
        <Text style={[styles.headerText, { flex: 2 }]}>Date</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>In</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Out</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Hours</Text>
      </View>
      <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => item.date} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F5F3FF" },
  center: { flex: 1, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  header: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: "#E5E7EB", marginBottom: 4 },
  headerText: { fontSize: 12, fontWeight: "600", color: "#6B7280", textTransform: "uppercase" },
  row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  date: { flex: 2, fontSize: 14, color: "#374151" },
  time: { flex: 1.5, fontSize: 14, color: "#6B7280" },
  hours: { flex: 1, fontSize: 14, color: "#4F46E5", fontWeight: "600" },
});
