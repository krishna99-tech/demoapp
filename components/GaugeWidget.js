import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GaugeWidget({ title, value, telemetry, icon }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [value, telemetry]); // animate when either changes

  const displayValue = telemetry !== undefined ? parseFloat(telemetry) : parseFloat(value);
  const numericValue = isNaN(displayValue) ? 0 : displayValue;
  const percentage = Math.min(Math.max(numericValue, 0), 100);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Ionicons name={icon || "speedometer-outline"} size={30} color="#007AFF" />
      <View style={styles.gaugeBar}>
        <View style={[styles.gaugeFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{telemetry !== undefined ? telemetry : value}</Text>
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
  gaugeBar: {
    width: "80%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginVertical: 10,
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  title: { fontSize: 13, color: "#333", fontWeight: "600" },
  value: { fontSize: 14, color: "#000", fontWeight: "bold", marginTop: 4 },
});
