import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { BASE_URL, WS_URL } from "../screens/config";
import API from "../services/api";

export const AuthContext = createContext(null);

// ====================================
// ✅ Custom Hook
// ====================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ====================================
// 🌐 Auth Provider
// ====================================
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [devices, setDevices] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const wsRef = useRef(null);

  // ====================================
  // 🏁 INIT: restore session
  // ====================================
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedUser = await AsyncStorage.getItem("username");
        if (token && storedUser) {
          setUserToken(token);
          setUsername(storedUser);
          await fetchDevices(token);

          connectWebSocket(token);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ====================================
  // 🔐 LOGIN
  // ====================================
  const login = async (usernameInput, passwordInput, navigation) => {
    try {
      if (!usernameInput?.trim() || !passwordInput)
        throw new Error("Username/email and password required");

      const data = await API.login(usernameInput.trim(), passwordInput);

      if (data?.access_token) {
        await AsyncStorage.setItem("userToken", data.access_token);
        await AsyncStorage.setItem("refreshToken", data.refresh_token || "");
        await AsyncStorage.setItem(
          "username",
          data.user?.username || usernameInput.trim()
        );

        setUserToken(data.access_token);
        setUsername(data.user?.username || usernameInput.trim());

        await fetchDevices(data.access_token);

        connectWebSocket(data.access_token);

        Alert.alert("Login Success", `Welcome ${data.user?.username || ""}!`);
        navigation?.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      } else {
        throw new Error(data?.detail || "Invalid credentials");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      Alert.alert("Login Failed", err.message || "Check your credentials");
    }
  };

  // ====================================
  // 🧩 SIGNUP
  // ====================================
  const signup = async (userData) => {
    try {
      const data = await API.signup(userData);
      if (data?.access_token) {
        await AsyncStorage.setItem("userToken", data.access_token);
        await AsyncStorage.setItem("username", data.user?.username);
        setUserToken(data.access_token);
        setUsername(data.user?.username);
        await fetchDevices(data.access_token);
        connectWebSocket(data.access_token);
        Alert.alert("Signup Success", "Welcome!");
      } else {
        throw new Error("Signup failed");
      }
    } catch (err) {
      Alert.alert("Signup Error", err.message);
    }
  };

  // ====================================
  // 🚪 LOGOUT
  // ====================================
  const logout = async () => {
    try {
      await API.logout();
      wsRef.current?.close();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      await AsyncStorage.multiRemove([
        "userToken",
        "username",
        "refreshToken",
      ]);
      setUserToken(null);
      setUsername(null);
      setDevices([]);
      setWidgets([]);
    }
  };

  // ====================================
  // ⚙️ DEVICES
  // ====================================
  const fetchDevices = async (token = userToken) => {
    try {
      const data = await API.getDevices();
      if (Array.isArray(data)) {
        setDevices(data);
      }
    } catch (err) {
      console.error("Fetch devices failed:", err);
    }
  };

  const addDevice = async (deviceData) => {
    try {
      const data = await API.addDevice(deviceData);
      if (data) {
        setDevices((prev) => [...prev, data]);
        Alert.alert("Device added successfully");
      }
    } catch (err) {
      Alert.alert("Add device failed", err.message);
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      await API.deleteDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      Alert.alert("Device deleted");
    } catch (err) {
      Alert.alert("Delete failed", err.message);
    }
  };

  const updateDeviceStatus = (deviceId, newStatus) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d))
    );
  };

  // ====================================
  // 🌐 TELEMETRY
  // ====================================
  const fetchTelemetry = async (device_token) => {
    try {
      const json = await API.getTelemetry(device_token);
      return json?.data || {};
    } catch (err) {
      console.error("Fetch telemetry error:", err);
      return {};
    }
  };

  // ====================================
  // ⚡ WEBSOCKET
  // ====================================
  const connectWebSocket = (token) => {
    if (!token) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    let pingInterval;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN)
          ws.send(JSON.stringify({ type: "ping" }));
      }, 30000);
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📩 WS:", msg);

        switch (msg.type) {
          case "status_update":
            updateDeviceStatus(msg.device_id, msg.status);
            break;

          case "telemetry_update":
            setDevices((prev) =>
              prev.map((d) =>
                d.id === msg.device_id
                  ? { ...d, telemetry: msg.data, lastTelemetry: msg.timestamp }
                  : d
              )
            );

            // ✅ Also update widgets that use this device
            setWidgets((prev) =>
              prev.map((w) =>
                w.device_id === msg.device_id
                  ? { ...w, latest_telemetry: msg.data }
                  : w
              )
            );

            break;

          case "widget_update":
            setWidgets((prev) => {
              const exists = prev.some((w) => w._id === msg.widget._id);
              return exists
                ? prev.map((w) =>
                    w._id === msg.widget._id ? { ...w, ...msg.widget } : w
                  )
                : [...prev, msg.widget];
            });
            break;

          case "device_added":
            setDevices((prev) =>
              prev.find((d) => d.id === msg.data.id)
                ? prev
                : [...prev, msg.data]
            );
            break;

          case "device_removed":
            setDevices((prev) => prev.filter((d) => d.id !== msg.data.id));
            break;

          case "pong":
            break;

          default:
            console.warn("Unknown WS message:", msg.type);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onclose = () => {
      console.warn("⚠️ WS closed, reconnecting...");
      clearInterval(pingInterval);
      setTimeout(() => connectWebSocket(token), 5000);
    };

    ws.onerror = (err) => {
      console.error("WS error:", err.message);
      ws.close();
    };
  };

  // ====================================
  // 🌍 CONTEXT PROVIDER VALUE
  // ====================================
  return (
    <AuthContext.Provider
      value={{
        userToken,
        username,
        devices,
        widgets,
        setWidgets,
        addDevice,
        deleteDevice,
        fetchDevices,
        updateDeviceStatus,
        fetchTelemetry,
        connectWebSocket,
        login,
        signup,
        logout,
        isDarkTheme,
        setIsDarkTheme,
        loading,
        lastUpdated,
        wsRef,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
