import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext"; // ✅ correct


//if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
 // UIManager.setLayoutAnimationEnabledExperimental(true);
//}

export default function NotificationsScreen() {
  const { isDarkTheme } = useContext(AuthContext);
  const theme = isDarkTheme ? "dark" : "light";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [lastUpdated, setLastUpdated] = useState(null);

  // Simulated data loader (replace this with your Python backend API later)
  const loadNotifications = async () => {
    try {
      // Simulated delay (mimic backend fetch)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example dummy data
      const data = [
        {
          id: "1",
          title: "Temperature Alert",
          message: "Device DHT11 exceeded safe threshold (35°C)",
          type: "warning",
          details:
            "Sensor ID: DHT11_01\nLocation: Lab 2\nThreshold: 35°C\nCurrent: 38°C",
          time: "10:42 AM",
        },
        {
          id: "2",
          title: "Device Online",
          message: "ESP32 connected successfully to server",
          type: "info",
          details:
            "Device IP: 192.168.29.101\nConnection: Stable\nSignal: -64 dBm",
          time: "10:30 AM",
        },
        {
          id: "3",
          title: "New Firmware Update",
          message: "Version 1.2.3 ready for installation.",
          type: "update",
          details:
            "Release Notes:\n• Improved Modbus stability\n• Fixed RS485 timing issue",
          time: "10:15 AM",
        },
      ];

      setNotifications(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const renderIcon = (type) => {
    switch (type) {
      case "warning":
        return { name: "alert-circle", color: "#ffcc00" };
      case "info":
        return { name: "information-circle", color: "#4dabf7" };
      case "update":
        return { name: "arrow-up-circle", color: "#00e676" };
      default:
        return { name: "notifications-outline", color: "#aaa" };
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const { name, color } = renderIcon(item.type);
    const isExpanded = expanded === item.id;

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand(item.id)}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor:
                theme === "dark" ? "rgba(255,255,255,0.05)" : "#ffffffcc",
              borderColor: theme === "dark" ? "#333" : "#ccc",
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Ionicons name={name} size={30} color={color} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: theme === "dark" ? "#fff" : "#000" },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.message,
                  { color: theme === "dark" ? "#ccc" : "#333" },
                ]}
              >
                {item.message}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color={theme === "dark" ? "#aaa" : "#333"}
            />
          </View>

          {isExpanded && (
            <View style={styles.detailsContainer}>
              <Text
                style={[
                  styles.detailsText,
                  { color: theme === "dark" ? "#aaa" : "#444" },
                ]}
              >
                {item.details}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  { color: theme === "dark" ? "#777" : "#555" },
                ]}
              >
                {item.time}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={
        theme === "dark"
          ? ["#0f2027", "#203a43", "#2c5364"]
          : ["#e0eafc", "#cfdef3"]
      }
      style={styles.gradient}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text
          style={[styles.header, { color: theme === "dark" ? "#fff" : "#000" }]}
        >
           Notifications
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme === "dark" ? "#80b3ff" : "#007bff"}
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme === "dark" ? "#fff" : "#000"}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme === "dark" ? "#aaa" : "#666" },
                  ]}
                >
                  No new notifications.
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}

        {lastUpdated && (
          <Text
            style={[
              styles.timestamp,
              { color: theme === "dark" ? "#aaa" : "#555" },
            ]}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    marginTop: 2,
  },
  detailsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  timestamp: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
