import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";
import { showToast } from "../components/Toast";
import { formatDate } from "../utils/format";
import * as Clipboard from "expo-clipboard";
import { ActivityIndicator } from "react-native";
import {
  Wifi,
  AlertTriangle,
  Trash2,
  RefreshCw,
  MapPin,
  Clock,
  Cpu,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Flame,
  Zap,
  Copy,
  Star,
  FileCode,
  Code,
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { moderateScale } from "../utils/scaling";
import WidgetRenderer from "../components/widgets/WidgetRenderer";
import DeviceDetailSkeleton from "../components/Devices/DeviceDetailSkeleton";
import { BASE_URL } from "../constants/config";

const COLORS = {
  background: "#0A0E27",
  card: "#1A1F3A",
  cardBorder: "#252B4A",
  primary: "#00D9FF",
  secondary: "#7B61FF",
  success: "#00FF88",
  warning: "#FFB800",
  danger: "#FF3366",
  text: "#FFFFFF",
  textSecondary: "#8B91A7",
  online: "#00FF88",
  offline: "#FF3366",
};

function getSensorIcon(type, size, color) {
  switch (type) {
    case "temperature":
      return <Thermometer size={size} color={color} />;
    case "humidity":
      return <Droplets size={size} color={color} />;
    case "light":
      return <Lightbulb size={size} color={color} />;
    case "pressure":
      return <Wind size={size} color={color} />;
    case "gas":
      return <Flame size={size} color={color} />;
    case "motion":
    case "door":
    case "smoke":
      return <Zap size={size} color={color} />;
    default:
      return <Activity size={size} color={color} />;
  }
}

// Helper to ensure dates are treated as UTC if missing timezone info
const parseDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
    return new Date(date + 'Z');
  }
  return new Date(date);
};

function getTimeSince(date) {
  if (!date) return "never";
  const seconds = Math.floor((new Date().getTime() - parseDate(date).getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// --- Memoized Sensor Card Component ---
const SensorCard = React.memo(({ sensor, onPress, Colors }) => (
  <TouchableOpacity
    style={[styles.sensorCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder }]}
    activeOpacity={0.8}
    onPress={() => onPress(sensor)}
  >
    <View style={[styles.sensorIconContainer, { backgroundColor: `${Colors.primary}1A` }]}>
      {getSensorIcon(sensor.type, 24, Colors.primary)}
    </View>
    <Text style={[styles.sensorLabel, { color: Colors.text }]}>{sensor.label}</Text>
    <View style={styles.sensorValueContainer}>
      <Text style={[styles.sensorValue, { color: Colors.primary }]}>
        {typeof sensor.value === "number"
          ? sensor.value.toFixed(sensor.type === "temperature" ? 1 : 0)
          : String(sensor.value)}
      </Text>
      <Text style={[styles.sensorUnit, { color: Colors.textSecondary }]}>{sensor.unit}</Text>
    </View>
    <Text style={[styles.sensorTimestamp, { color: Colors.textSecondary }]}>
      Updated {getTimeSince(sensor.timestamp)}
    </Text>
  </TouchableOpacity>
));

export default function DeviceDetailScreen({ route, navigation }) {
  const { deviceId } = route.params;
  const { devices, deleteDevice, fetchTelemetry, userToken, logout, isDarkTheme, showAlert, isRefreshing: isContextRefreshing } = useContext(AuthContext);

  // --- Refactored State for Single Modal Flow ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState('select_widget'); // 'select_widget' or 'select_dashboard'
  const [dashboards, setDashboards] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  
  // --- Code Examples Modal ---
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [selectedCodeType, setSelectedCodeType] = useState('esp32'); // 'esp32' or 'python'
  
  // --- FAVORITES (New Feature) ---
  // In a real app, this state and toggle function would come from AuthContext
  const [isFavorite, setIsFavorite] = useState(false); 

  // --- Theme-aware Colors ---
  const Colors = useMemo(() => ({
    background: isDarkTheme ? "#0A0E27" : "#F1F5F9",
    card: isDarkTheme ? "#1A1F3A" : "#FFFFFF",
    cardBorder: isDarkTheme ? "#252B4A" : "#E2E8F0",
    primary: isDarkTheme ? "#00D9FF" : "#3B82F6",
    secondary: isDarkTheme ? "#7B61FF" : "#6D28D9",
    success: isDarkTheme ? "#00FF88" : "#16A34A",
    warning: isDarkTheme ? "#FFB800" : "#F59E0B",
    danger: isDarkTheme ? "#FF3366" : "#DC2626",
    text: isDarkTheme ? "#FFFFFF" : "#1E293B",
    textSecondary: isDarkTheme ? "#8B91A7" : "#64748B",
    online: "#00FF88",
    offline: "#FF3366",
  }), [isDarkTheme]);

  const device = devices.find((d) => String(d.id || d._id) === String(deviceId));

  const sensors = useMemo(() => {
    if (!device?.telemetry) return [];
    return Object.entries(device.telemetry).map(([key, value]) => ({
      id: key,
      type: key, // Assuming type is same as key for icon mapping
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: value,
      unit: key.toLowerCase().includes("temp") ? "°C" : key.toLowerCase().includes("hum") ? "%" : "",
      timestamp: parseDate(device.lastTelemetry || device.last_active) || new Date(),
    }));
  }, [device]);

  // Calculate device status based on last_active timestamp
  const getDeviceStatus = useCallback((device) => {
    if (!device) return "offline";
    
    // If device has explicit status, use it (but verify it's still valid)
    if (device.status === "online" && device.last_active) {
      const lastActive = parseDate(device.last_active);
      const now = new Date();
      const secondsSinceActive = (now - lastActive) / 1000;
      
      // Device is considered offline if last_active is more than 60 seconds ago
      // Increased from 20s to allow for network latency and heartbeat intervals
      if (secondsSinceActive > 60) {
        return "offline";
      }
      return "online";
    }
    
    // If no explicit status or status is offline, check last_active
    if (device.last_active) {
      const lastActive = parseDate(device.last_active);
      const now = new Date();
      const secondsSinceActive = (now - lastActive) / 1000;
      
      if (secondsSinceActive <= 60) {
        return "online";
      }
    }
    
    return device.status || "offline";
  }, []);

  const handleRefresh = useCallback(() => {
    if (!device?.device_token) return;
    setRefreshing(true);
    fetchTelemetry(device.device_token)
      .catch((err) => {
        console.error("Failed to refresh telemetry:", err);
        showAlert({ type: 'error', title: "Refresh Failed", message: "Could not fetch latest device data." });
      })
      .finally(() => setRefreshing(false));
  }, [device?.device_token, fetchTelemetry, showAlert]);

  useEffect(() => {
    if (device) {
      navigation.setOptions({
        headerTitle: device.name,
      });
    }
  }, [device, navigation, Colors]);

  // Show skeleton while context is refreshing and device is not yet found
  if (isContextRefreshing && !device) {
    return <DeviceDetailSkeleton isDarkTheme={isDarkTheme} />;
  }

  if (!device) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={64} color={Colors.danger} />
          <Text style={[styles.errorTitle, { color: Colors.text }]}>Device not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCopyToken = useCallback(async () => {
    await Clipboard.setStringAsync(device.device_token);
    showToast.success("Token copied to clipboard!");
  }, [device.device_token]);

  const handleDeleteDevice = useCallback(() => {
    setAlertConfig({
      type: 'confirm',
      title: "Delete Device",
      message: "Are you sure?",
      buttons: [
        { text: "Cancel", style: "cancel", onPress: () => setAlertVisible(false) },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setAlertVisible(false);
            await deleteDevice(device.id || device._id);
            navigation.goBack();
          },
        },
      ]
    });
    setAlertVisible(true);
  }, [deleteDevice, device, navigation]);

  // Set header options, including buttons with stable callbacks
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {/* Code Examples Button - More visible */}
          <TouchableOpacity 
            onPress={() => setCodeModalVisible(true)} 
            style={[styles.headerButton, styles.codeButton]}
            accessibilityLabel="View integration code examples"
          >
            <FileCode size={20} color={Colors.primary} />
          </TouchableOpacity>
          {/* Favorite Button (New Feature) */}
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerButton}>
            <Star size={22} color={isFavorite ? Colors.warning : Colors.primary} fill={isFavorite ? Colors.warning : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}><RefreshCw size={20} color={Colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteDevice} style={styles.headerButton}><Trash2 size={20} color={Colors.danger} /></TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleRefresh, handleDeleteDevice, Colors, isFavorite]);

  const handleSensorPress = useCallback((sensor) => {
    setSelectedSensor(sensor);
    setModalStep('select_widget');
    setModalVisible(true);
  }, []);

  const fetchDashboards = async () => {
    if (!userToken) {
      setAlertConfig({
        type: 'error', title: "Session expired", message: "Please login again.", buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
      return;
    }
    try {
      const data = await api.getDashboards();
      setDashboards(data);
    } catch (err) {
      console.error(err);
      setAlertConfig({ // API service will handle 401
        type: 'error', title: "Error", message: "Could not load dashboards", buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
    }
  };

  const handleWidgetSelect = (type) => {
    setSelectedWidgetType(type);
    setModalStep('select_dashboard');
    fetchDashboards();
  };

  const exportToDashboard = async (dashboardId) => {
    if (!userToken || !selectedSensor || !selectedWidgetType) {
      setAlertConfig({
        type: 'error', title: "Error", message: "Missing required information.", buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Store label before resetting state
      const widgetLabel = selectedSensor?.label;

      const payload = {
        dashboard_id: dashboardId,
        device_id: device._id,
        type: selectedWidgetType,        label: widgetLabel,
        config: { key: selectedSensor.id },
      };

      if (selectedWidgetType === "led") {
        payload.value = selectedSensor.value ? 1 : 0;
      } else {
        payload.value = selectedSensor.value;
      }

      await api.addWidget(payload);

      setModalVisible(false);
      setSelectedSensor(null);
      setSelectedWidgetType(null);
      showToast.success(`Widget '${widgetLabel || 'Sensor'}' added to dashboard`);
    } catch (err) {
      console.error("Export to dashboard error:", err);

      // API service will handle 401 and logout if refresh fails
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setAlertConfig({
          type: 'error', title: "Timeout", message: "Request took too long. Please check your connection.", buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
        });
        setAlertVisible(true);
      } else {
        const errorMessage =
          err.response?.data?.detail || err.message || "Failed to export telemetry";
        setAlertConfig({
          type: 'error', title: "Error", message: errorMessage, buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
        });
        setAlertVisible(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate actual device status based on last_active
  const actualStatus = useMemo(() => getDeviceStatus(device), [device, getDeviceStatus]);
  
  const statusColor =
    actualStatus === "online" ? Colors.online
    : actualStatus === "offline" ? Colors.offline
    : Colors.warning;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={[styles.statusCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.deviceIcon, { backgroundColor: `${Colors.primary}1A` }]}>
              <Cpu size={32} color={Colors.primary} />
            </View>
            <View style={styles.statusInfo}>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {actualStatus.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.deviceType, { color: Colors.textSecondary }]}>{device.type}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.cardBorder }]} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Location</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>{device.location || "Not set"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Last Seen</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>{getTimeSince(device.last_active)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Wifi size={16} color={Colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>IP Address</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>{device.ipAddress || "Unknown"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Activity size={16} color={Colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Firmware</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>
                {device.firmwareVersion || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Device ID & Access Token</Text>
          </View>
          <View style={[styles.tokenCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 20, marginTop: 4, marginBottom: 12, gap: 12, elevation: 5, shadowColor: Colors.primary, shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } }]}>
            {/* Device ID row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: `${Colors.primary}06`, borderRadius: 12, borderWidth: 1, borderColor: `${Colors.primary}30`, marginBottom: 8 }}>
              <Text selectable style={{ flex: 1, color: Colors.text, fontFamily: 'monospace', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }} numberOfLines={1} ellipsizeMode="middle">
                {String(device._id || device.id)}
              </Text>
              <TouchableOpacity onPress={() => { Clipboard.setStringAsync(String(device._id || device.id)); showToast.success('Device ID copied!'); }} style={{ padding: 7, backgroundColor: `${Colors.primary}22`, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Copy size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={{ color: Colors.textSecondary, fontSize: 13, marginLeft: 3, fontWeight: '700', letterSpacing: 2 }}>ID</Text>
            </View>

            {/* Device Token row (styled to match) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: `${Colors.primary}09`, borderRadius: 12, borderWidth: 1, borderColor: `${Colors.primary}40` }}>
              <Text selectable style={{ flex: 1, color: Colors.primary, fontFamily: 'monospace', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }} numberOfLines={1} ellipsizeMode="middle">
                {device.device_token}
              </Text>
              <TouchableOpacity onPress={handleCopyToken} style={{ padding: 7, backgroundColor: `${Colors.primary}31`, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Copy size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={{ color: Colors.textSecondary, fontSize: 13, marginLeft: 3, fontWeight: '700', letterSpacing: 2 }}>TOKEN</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              Sensors ({sensors.length})
            </Text>
          </View>
          <FlatList
            data={sensors}
            renderItem={({ item }) => (
              <SensorCard sensor={item} onPress={handleSensorPress} Colors={Colors} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.sensorsGrid}
            scrollEnabled={false} // The list is inside a ScrollView
            // The empty component is handled below
          />
          {sensors.length === 0 && (
            <View style={styles.emptyState}>
              <Activity size={48} color={Colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>No sensors configured</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Refresh Telemetry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- Refactored Add to Dashboard Modal --- */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: Colors.card }]}>
            {modalStep === 'select_widget' && (
              <>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>Add Widget for '{selectedSensor?.label}'</Text>
                <Text style={[styles.modalSub, { color: Colors.textSecondary }]}>Choose a widget style to display this sensor on a dashboard.</Text>
                <View style={styles.widgetOptions}>
                  {[
                    "card", "gauge", "indicator", "chart", 
                    "digital", "thermometer", "tank", "battery",
                    "status", "energy"
                  ].map((type) => (
                    <Pressable key={type} style={styles.widgetOption} onPress={() => handleWidgetSelect(type)}>
                      <View style={styles.widgetPreview}>
                        <WidgetRenderer
                          item={{
                            type: type,
                            label: selectedSensor?.label,
                            value: selectedSensor?.value,
                            config: { key: selectedSensor?.id },
                            device_id: device?._id,
                          }}
                          isDarkTheme={isDarkTheme}
                        />
                      </View>
                      <Text style={[styles.widgetText, { color: Colors.primary }]}>{type.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {modalStep === 'select_dashboard' && (
              <>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>Select Dashboard</Text>
                <Text style={[styles.modalSub, { color: Colors.textSecondary }]}>Where should this widget be added?</Text>
                {isSubmitting ? <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.primary} /> : (
                  <FlatList
                    data={dashboards}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                      <Pressable
                        style={[styles.dashboardItem, { backgroundColor: Colors.cardBorder }]}
                        onPress={() => exportToDashboard(item._id)}
                      >
                        <Text style={[styles.dashboardName, { color: Colors.text }]}>{item.name}</Text>
                        <Text style={[styles.dashboardDesc, { color: Colors.textSecondary }]}>{item.description}</Text>
                      </Pressable>
                    )}
                    ListEmptyComponent={() => (
                      <Text style={{ textAlign: 'center', color: Colors.textSecondary, marginVertical: 20 }}>No dashboards found.</Text>
                    )}
                    style={{ maxHeight: 250, marginVertical: 10 }}
                  />
                )}
              </>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} disabled={isSubmitting}>
              <Text style={[styles.cancelText, { color: Colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Code Examples Modal */}
      <Modal 
        visible={codeModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.codeModalView, { backgroundColor: Colors.card }]}>
            <View style={styles.codeModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileCode size={24} color={Colors.primary} />
                <Text style={[styles.codeModalTitle, { color: Colors.text }]}>Integration Code Examples</Text>
              </View>
              <TouchableOpacity onPress={() => setCodeModalVisible(false)}>
                <Text style={[styles.codeModalClose, { color: Colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Code Type Selector */}
            <View style={styles.codeTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.codeTypeButton,
                  { backgroundColor: selectedCodeType === 'esp32' ? Colors.primary + '20' : Colors.cardBorder },
                  selectedCodeType === 'esp32' && { borderColor: Colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedCodeType('esp32')}
              >
                <Code size={18} color={selectedCodeType === 'esp32' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.codeTypeText, { color: selectedCodeType === 'esp32' ? Colors.primary : Colors.textSecondary }]}>
                  ESP32 (Arduino)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.codeTypeButton,
                  { backgroundColor: selectedCodeType === 'python' ? Colors.primary + '20' : Colors.cardBorder },
                  selectedCodeType === 'python' && { borderColor: Colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedCodeType('python')}
              >
                <Code size={18} color={selectedCodeType === 'python' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.codeTypeText, { color: selectedCodeType === 'python' ? Colors.primary : Colors.textSecondary }]}>
                  Python
                </Text>
              </TouchableOpacity>
            </View>

            {/* Code Display */}
            <ScrollView 
              style={styles.codeScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={[styles.codeBlock, { backgroundColor: Colors.background }]}>
                <View style={styles.codeBlockHeader}>
                  <Text style={[styles.codeBlockTitle, { color: Colors.text }]}>
                    {selectedCodeType === 'esp32' ? 'ESP32 Arduino Code' : 'Python Code'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: Colors.primary + '20' }]}
                    onPress={async () => {
                      const code = selectedCodeType === 'esp32' 
                        ? generateESP32Code(device, BASE_URL)
                        : generatePythonCode(device, BASE_URL);
                      await Clipboard.setStringAsync(code);
                      showToast.success("Code copied to clipboard!");
                    }}
                  >
                    <Copy size={16} color={Colors.primary} />
                    <Text style={[styles.copyButtonText, { color: Colors.primary }]}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text 
                  selectable
                  style={[styles.codeText, { color: Colors.text, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }) }]}
                >
                  {selectedCodeType === 'esp32' 
                    ? generateESP32Code(device, BASE_URL)
                    : generatePythonCode(device, BASE_URL)}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Local Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        isDarkTheme={isDarkTheme}
        {...alertConfig}
      />
    </View>
  );
}

// Generate ESP32 Integration Guide
function generateESP32Code(device, baseUrl) {
  const deviceId = String(device._id || device.id);
  const deviceToken = device.device_token || 'YOUR_DEVICE_TOKEN_HERE';
  
  return `/* ESP32 Integration with ThingsNXT */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// 📶 WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ☁️ ThingsNXT Configuration
const char* deviceToken = "${deviceToken}";
String serverUrl = "${baseUrl}/devices/${deviceId}/telemetry";

// 🔌 Virtual Pin Mapping (Example)
struct PinMapping { uint8_t vPin; uint8_t gpio; };
PinMapping VIRTUAL_PIN_MAPPING[] = {
  {0, 2}, // Map Virtual Pin v0 to GPIO 2
};
const uint8_t PIN_COUNT = sizeof(VIRTUAL_PIN_MAPPING) / sizeof(VIRTUAL_PIN_MAPPING[0]);

void setup() {
  Serial.begin(115200);
  for (uint8_t i = 0; i < PIN_COUNT; i++) pinMode(VIRTUAL_PIN_MAPPING[i].gpio, OUTPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    DynamicJsonDocument doc(512);
    doc["device_token"] = deviceToken;
    doc["uptime"] = millis();
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      String response = http.getString();
      DynamicJsonDocument resDoc(2048);
      deserializeJson(resDoc, response);
      
      JsonObject data = resDoc["data"];
      
      // Handle Virtual Pins
      for (uint8_t i = 0; i < PIN_COUNT; i++) {
        String key = "v" + String(VIRTUAL_PIN_MAPPING[i].vPin);
        if (data.containsKey(key)) {
          digitalWrite(VIRTUAL_PIN_MAPPING[i].gpio, data[key] ? HIGH : LOW);
        }
      }
    }
    http.end();
  }
  delay(2000);
}`;
}

// Generate Python Integration Guide
function generatePythonCode(device, baseUrl) {
  const deviceId = String(device._id || device.id);
  const deviceToken = device.device_token || 'YOUR_DEVICE_TOKEN_HERE';
  
  return `Python Integration with ThingsNXT Platform
============================================

📡 API ENDPOINT URL:
${baseUrl}/devices/${deviceId}/telemetry

🔑 AUTHENTICATION:
Method: POST
Content-Type: application/json

📝 PYTHON CODE EXAMPLE:
import requests

DEVICE_ID = "${deviceId}"
DEVICE_TOKEN = "${deviceToken}"
SERVER_URL = f"${baseUrl}/devices/{DEVICE_ID}/telemetry"

def send_telemetry():
    # Payload: Include Device Token in JSON body
    payload = {
        "device_token": DEVICE_TOKEN,
        "temperature": 25.5,  # Your sensor data
        "humidity": 60.0,     # Your sensor data
        "pressure": 1013.25,  # Your sensor data
    }
    
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(SERVER_URL, json=payload, headers=headers)
    return response

# Usage
response = send_telemetry()
print(response.status_code)
print(response.json())

✅ KEY POINTS:
• Device ID goes in the URL path
• Device Token goes in the JSON payload
• Use POST method
• Include Content-Type: application/json header
• Install: pip install requests`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is set dynamically
  },
  scrollView: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  codeButton: {
    // Make code button slightly more visible
    backgroundColor: 'transparent',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  deviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusInfo: {
    flex: 1,
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    width: "48%",
    gap: 6,
  },
  infoLabel: {
    fontSize: moderateScale(12),
  },
  infoValue: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  tokenCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sensorCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    width: "48.5%", // Adjusted for better spacing in a 2-column layout
    gap: 8,
  },
  sensorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  sensorLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
  },
  sensorValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  sensorValue: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "700",
  },
  sensorUnit: {
    fontSize: moderateScale(14),
  },
  sensorTimestamp: {
    fontSize: moderateScale(11),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: moderateScale(14),
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  refreshButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: COLORS.background,
  },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalView: { width: "90%", maxWidth: 400, borderRadius: 16, padding: 20, elevation: 6 },
  modalTitle: { fontSize: moderateScale(20), fontWeight: "bold", marginBottom: 4, textAlign: 'center' },
  modalSub: { marginBottom: 16, textAlign: "center", fontSize: moderateScale(14) },
  widgetOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
    gap: 10,
  },
  widgetOption: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  widgetPreview: {
    height: 140,
    width: '100%',
    transform: [{ scale: 0.8 }], // Scale down for preview
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  widgetText: {
    fontWeight: "600",
    fontSize: moderateScale(12),
  },
  dashboardItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  dashboardName: {
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },
  dashboardDesc: {
    fontSize: moderateScale(14)
  },
  cancelText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: moderateScale(16),
    padding: 10,
    fontWeight: '600',
  },
  tokenText: {
    flex: 1, // Allow text to take available space
    fontSize: moderateScale(14),
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
  },
  sensorsGrid: {
    // Now used as columnWrapperStyle for FlatList
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Code Modal Styles
  codeModalView: {
    width: "95%",
    maxWidth: 500,
    maxHeight: "90%",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  codeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  codeModalClose: {
    fontSize: 24,
    fontWeight: "300",
    padding: 4,
  },
  codeTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  codeTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  codeScrollView: {
    maxHeight: 500,
    borderRadius: 12,
    overflow: 'hidden',
  },
  codeBlock: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBlockTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  codeText: {
    fontSize: 11,
    lineHeight: 18,
  },
});