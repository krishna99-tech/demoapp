import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function IndicatorWidget({ title, value, telemetry, icon }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [value, telemetry]); // animate on value or telemetry change

  const displayValue = telemetry !== undefined ? telemetry : value;
  const isActive =
    displayValue?.toString().toLowerCase() === "on" || displayValue === "1" || displayValue === true;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}>
      <Ionicons
        name={icon || "power-outline"}
        size={32}
        color={isActive ? "#34C759" : "#FF3B30"}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.status, { color: isActive ? "#34C759" : "#FF3B30" }]}>
        {isActive ? "ON" : "OFF"}
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    margin: 8,
  },
  title: { fontSize: 14, color: "#333", fontWeight: "600", marginTop: 8 },
  status: { fontSize: 16, fontWeight: "bold", marginTop: 6 },
});
