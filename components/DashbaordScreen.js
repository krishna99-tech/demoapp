import React, { useEffect, useRef, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../screens/config";

// 🧩 Widget components
import CardWidget from "../components/CardWidget";
import GaugeWidget from "../components/GaugeWidget";
import IndicatorWidget from "../components/IndicatorWidget";
import LEDControlWidget from "../components/LEDControlWidget";

export default function DashboardScreen({ route, navigation }) {
  const { dashboard } = route.params || {};
  const { userToken, logout, wsRef, widgets, setWidgets } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const mountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  // 🧹 Delete dashboard
  const handleDeleteDashboard = () => {
    Alert.alert("Delete Dashboard", "Delete this dashboard?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/dashboards/${dashboard._id}`, {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            Alert.alert("Deleted", "Dashboard removed successfully");
            navigation.goBack();
          } catch (err) {
            console.error("❌ Delete dashboard error:", err);
            if (err.response?.status === 401) logout();
            Alert.alert("Error", "Failed to delete dashboard");
          }
        },
      },
    ]);
  };

  // 🧩 Map devices to tokens (for LED widgets)
  const fetchDevicesMap = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      return res.data.reduce((map, d) => {
        map[d._id] = d.device_token;
        return map;
      }, {});
    } catch (err) {
      console.error("❌ Fetch devices error:", err);
      if (err.response?.status === 401) logout();
      return {};
    }
  };

  // 📦 Fetch widgets
  const fetchWidgets = async () => {
    if (isFetchingRef.current || !userToken || !dashboard?._id) return;
    isFetchingRef.current = true;

    try {
      if (!refreshing) setLoading(true);
      console.log("📡 Fetching widgets for dashboard:", dashboard._id);

      const deviceMap = await fetchDevicesMap();
      const res = await axios.get(`${API_BASE}/widgets/${dashboard._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const fetched =
        Array.isArray(res.data) ? res.data : res.data.widgets || [];

      if (!Array.isArray(fetched)) {
        console.error("❌ Invalid widgets format from API:", res.data);
        return;
      }

      const processed = fetched
        .map((w, i) => {
          const id = w._id?.toString?.() || `temp-${dashboard._id}-${i}`;
          return {
            ...w,
            _id: id, // ✅ Ensure stable string ID
            device_token:
              w.type === "led" && w.device_id
                ? deviceMap[w.device_id] || null
                : null,
            value: w.value ?? "--",
          };
        })
        .filter((w) => w.type !== "led" || w.device_token);

      if (mountedRef.current) {
        console.log("✅ Widgets loaded:", processed.length);
        setWidgets(processed);
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (err) {
      console.error("❌ Fetch widgets error:", err);
      if (err.response?.status === 401) logout();
      Alert.alert("Error", "Failed to load widgets.");
    } finally {
      isFetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // 📡 WebSocket listener for telemetry + widget updates
  useEffect(() => {
    if (!wsRef?.current || !dashboard?._id) return;

    const handleWSMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "widget_update" && msg.dashboard_id === dashboard._id) {
          setWidgets((prev) => {
            const found = prev.some((w) => w._id === msg.widget._id);
            return found
              ? prev.map((w) =>
                  w._id === msg.widget._id ? { ...w, ...msg.widget } : w
                )
              : [...prev, msg.widget];
          });
        } else if (msg.type === "telemetry_update" && msg.device_id) {
          setWidgets((prev) =>
            prev.map((w) => {
              if (w.device_id === msg.device_id) {
                const key = w.config?.key;
                if (key && msg.data && key in msg.data) {
                  const newValue = msg.data[key];
                  return {
                    ...w,
                    value: newValue,
                    telemetry: { ...w.telemetry, [key]: newValue },
                  };
                }
              }
              return w;
            })
          );
        }
      } catch (err) {
        console.error("⚠️ WS parse error:", err);
      }
    };

    const socket = wsRef.current;
    socket.addEventListener("message", handleWSMessage);
    return () => socket.removeEventListener("message", handleWSMessage);
  }, [dashboard?._id, wsRef, setWidgets]);

  // 🧭 Fetch widgets on mount
  useEffect(() => {
    mountedRef.current = true;
    if (dashboard?._id) fetchWidgets();
    return () => {
      mountedRef.current = false;
    };
  }, [dashboard?._id, userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWidgets();
  };

  // 🗑️ Delete widget
  const handleDeleteWidget = (widgetId) => {
    Alert.alert("Delete Widget", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/widgets/${widgetId}`, {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            setWidgets((prev) => prev.filter((w) => w._id !== widgetId));
            Alert.alert("Deleted", "Widget deleted successfully");
          } catch (err) {
            console.error("❌ Delete widget error:", err);
            if (err.response?.status === 401) logout();
            Alert.alert("Error", "Failed to delete widget");
          }
        },
      },
    ]);
  };

  const handleWidgetLongPress = (widgetId) => {
    Alert.alert("Widget Options", "Manage this widget", [
      { text: "Cancel", style: "cancel" },
      { text: "Edit", onPress: () => console.log("Edit widget:", widgetId) },
      { text: "Delete", onPress: () => handleDeleteWidget(widgetId) },
    ]);
  };

  const renderWidget = ({ item }) => {
    const commonProps = {
      title: item.label || "Unnamed",
      value: item.value ?? "--",
      icon: item.icon || "speedometer-outline",
    };

    let component;
    switch (item.type) {
      case "gauge":
        component = <GaugeWidget {...commonProps} />;
        break;
      case "indicator":
        component = <IndicatorWidget {...commonProps} />;
        break;
      case "led":
        component = (
          <LEDControlWidget
            title={item.label || "LED Control"}
            deviceToken={item.device_token}
            initialState={item.value || false}
            onStateChange={fetchWidgets}
              onLongPress={() => handleWidgetLongPress(item._id)}
          />
        );
        break;
      default:
        component = <CardWidget {...commonProps} />;
        break;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        delayLongPress={600}
        onLongPress={() => handleWidgetLongPress(item._id)}
        style={styles.widgetItem}
      >
        {component}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#eef2f3", "#8e9eab"]} style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#eef2f3", "#8e9eab"]} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{dashboard?.name || "Dashboard"}</Text>
          <Text style={styles.subtitle}>
            {dashboard?.description || "Monitor your devices"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDeleteDashboard}>
          <Ionicons name="trash-outline" size={26} color="#ff3b30" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={widgets}
          renderItem={renderWidget}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.widgetGrid}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bulb-outline" size={50} color="#666" />
              <Text style={styles.placeholder}>
                No widgets yet. Add one from the dashboard editor.
              </Text>
            </View>
          }
        />
      </Animated.View>
    </LinearGradient>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ffffffcc",
    elevation: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#555", marginTop: 4 },
  widgetGrid: { padding: 12, paddingBottom: 60 },
  row: { justifyContent: "space-around" },
  widgetItem: { margin: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  placeholder: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 10,
  },
  loader: { marginTop: 80 },
  loadingText: { color: "#666", textAlign: "center", marginTop: 10 },
});
