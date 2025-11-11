import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE } from "../screens/config";

const POLL_INTERVAL = 4000;

export default function LEDControlWidget({
  title,
  deviceToken,       // <-- You MUST pass a valid token from the parent!
  initialState = false,
  onLongPress,
  onDelete,          // ✅ New prop for delete
}) {
  const [ledOn, setLedOn] = useState(initialState ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const pollTimer = useRef(null);

  useEffect(() => {
    console.log("LED Widget received deviceToken:", deviceToken);
  }, [deviceToken]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/telemetry/latest?device_token=${deviceToken}`
        );
        if (res.status === 200 && res.data?.data?.led !== undefined) {
          setLedOn(res.data.data.led ? 1 : 0);
        }
      } catch (err) {
        console.error("Polling error:", err.response?.data || err.message);
      }
      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    };
    if (deviceToken) poll();
    return () => clearTimeout(pollTimer.current);
  }, [deviceToken]);

  const toggleLED = async () => {
    setLoading(true);
    try {
      const newState = ledOn ? 0 : 1;
      if (!deviceToken) throw new Error("deviceToken not provided to LED widget!");
      const res = await axios.post(`${API_BASE}/telemetry`, {
        device_token: deviceToken,
        data: { led: newState },
      });
      if (res.status === 200) setLedOn(newState);
    } catch (err) {
      console.error("LED toggle error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: ledOn ? "#4cd964" : "#fff" }]}
      activeOpacity={0.8}
      onPress={toggleLED}
      onLongPress={onLongPress}
      delayLongPress={600}
      disabled={loading}
    >
      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      )}

      <Ionicons
        name={ledOn ? "bulb" : "bulb-outline"}
        size={30}
        color={ledOn ? "#fff" : "#007AFF"}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: ledOn ? "#fff" : "#333" }]}>{title}</Text>
      <Text style={[styles.status, { color: ledOn ? "#fff" : "#007AFF" }]}>
        {loading ? "..." : ledOn ? "ON" : "OFF"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 120,
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
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
    padding: 4,
    backgroundColor: "#ffffffaa",
    borderRadius: 12,
  },
  icon: { marginBottom: 8 },
  title: { fontSize: 14, fontWeight: "600" },
  status: { fontSize: 16, fontWeight: "bold", marginTop: 6 },
});
