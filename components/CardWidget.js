import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CardWidget({ title, value, telemetry, icon }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [value, telemetry]); // animate when either changes

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Ionicons name={icon} size={28} color="#007AFF" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>
        {telemetry !== undefined ? String(telemetry) : String(value)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    margin: 8,
  },
  icon: { marginBottom: 8 },
  title: { fontSize: 14, color: "#333", fontWeight: "600" },
  value: { fontSize: 12, color: "#000", fontWeight: "bold", marginTop: 6 },
});
