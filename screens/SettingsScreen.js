import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Shield,
  Smartphone,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
  Bell,
  Database, // For Data Export
  Trash2,   // For Clear Cache
  Palette,  // For Appearance
  Check,
} from "lucide-react-native";
import { LayoutDashboard } from "lucide-react-native";
import CustomAlert from "../components/CustomAlert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MenuItem from "../components/settings/MenuItem";
import { showToast } from "../components/Toast";

export default function SettingsScreen() {
  const {
    logout,
    username,
    email,
    isDarkTheme,
    showAlert,
    themePreference,
    setThemePreference,
  } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState("7d");
  const [isExporting, setIsExporting] = useState(false);

  // ⭐ This Colors object is a great candidate for centralization in a theme context/hook
  const Colors = {
    background: isDarkTheme ? "#0A0E27" : "#F1F5F9",
    surface: isDarkTheme ? "#1A1F3A" : "#FFFFFF",
    surfaceLight: isDarkTheme ? "#252B4A" : "#E2E8F0",
    border: isDarkTheme ? "#252B4A" : "#E2E8F0",
    primary: isDarkTheme ? "#00D9FF" : "#3B82F6",
    secondary: isDarkTheme ? "#7B61FF" : "#6D28D9",
    success: isDarkTheme ? "#00FF88" : "#16A34A",
    warning: isDarkTheme ? "#FFB800" : "#F59E0B",
    danger: isDarkTheme ? "#FF3366" : "#DC2626",
    white: "#FFFFFF",
    text: isDarkTheme ? "#FFFFFF" : "#1E293B",
    textSecondary: isDarkTheme ? "#8B91A7" : "#64748B",
    textMuted: isDarkTheme ? "#8B91A7" : "#64748B",
  };

  const handleLogout = () => {
    setAlertConfig({
      type: 'confirm',
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      buttons: [
        { text: "Cancel", style: "cancel", onPress: () => setAlertVisible(false) },
        { text: "Logout", style: "destructive", onPress: () => { setAlertVisible(false); logout(); } },
      ],
    });
    setAlertVisible(true);
  };

  const openWebView = (url, title) => {
    navigation.navigate('WebView', { url, title });
  };

  const handleClearCache = () => {
    setAlertConfig({
      type: 'confirm',
      title: "Clear Cache",
      message: "Are you sure you want to clear temporary app data? This action cannot be undone.",
      buttons: [
        { text: "Cancel", style: "cancel", onPress: () => setAlertVisible(false) },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => { setAlertVisible(false); showToast.success("Cache Cleared", "Temporary data has been removed."); }
        },
      ],
    });
    setAlertVisible(true);
  };

  const handleDataExport = () => {
    setExportModalVisible(true);
  };

  const handleExportConfirm = () => {
    setIsExporting(true);
    // Simulate API call
    setTimeout(() => {
      setIsExporting(false);
      setExportModalVisible(false);
      showToast.success(
        "Export Started",
        "Your data export has begun. You will receive an email with the download link shortly."
      );
    }, 2000);
  };


  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  const handleDashboardsPress = () => {
    navigation.navigate("Dashboards");
  };

  const handleThemeSelect = (mode) => {
    setThemePreference(mode);
    setThemeModalVisible(false);
  };

  // ⭐ Refactored Menu Structure
  const menuSections = [
    {
      title: "Account",
      items: [
        {
          icon: { component: <User size={20} color={Colors.primary} />, bgColor: Colors.primary + "20" },
          title: "Profile",
          subtitle: username || "Edit your personal information",
          onPress: handleProfilePress,
          rightComponent: { type: 'chevron' },
        },
        {
          icon: { component: <Shield size={20} color={Colors.success} />, bgColor: Colors.success + "20" },
          title: "Security",
          subtitle: "Change your password",
          onPress: () => navigation.navigate('ForgotPassword'),
          rightComponent: { type: 'chevron' },
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          icon: { component: <Smartphone size={20} color={Colors.secondary} />, bgColor: Colors.secondary + "20" },
          title: "Manage Devices",
          subtitle: "View and organize your devices",
          onPress: () => navigation.navigate("Devices"),
          rightComponent: { type: 'chevron' },
        },
        {
          icon: { component: <Bell size={20} color={Colors.danger} />, bgColor: Colors.danger + "20" },
          title: "Notifications",
          subtitle: "View alerts and system messages",
          onPress: () => navigation.navigate("Notifications"),
          rightComponent: { type: 'chevron' },
        },
        {
          icon: { component: <LayoutDashboard size={20} color={Colors.warning} />, bgColor: Colors.warning + "20" },
          title: "Manage Dashboards",
          subtitle: "Organize and customize dashboards",
          onPress: handleDashboardsPress,
          rightComponent: { type: 'chevron' },
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: { component: <Palette size={20} color={Colors.warning} />, bgColor: Colors.warning + "20" },
          title: "Appearance",
          subtitle: themePreference === 'system' ? "System Default" : (isDarkTheme ? "Dark Mode" : "Light Mode"),
          onPress: () => setThemeModalVisible(true),
          rightComponent: { type: 'chevron' },
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { icon: { component: <Database size={20} color={Colors.primary} />, bgColor: Colors.primary + "20" }, title: "Data Export", subtitle: "Download sensor data logs", onPress: handleDataExport, rightComponent: { type: 'chevron' } },
        { icon: { component: <Trash2 size={20} color={Colors.danger} />, bgColor: Colors.danger + "20" }, title: "Clear Cache", subtitle: "Clear temporary app data", onPress: handleClearCache },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: { component: <HelpCircle size={20} color={Colors.primary} />, bgColor: Colors.primary + "20" },
          title: "Help Center",
          subtitle: "FAQs and support articles",
          onPress: () => openWebView("https://thingsnxt.vercel.app/support", "Help Center"),
          rightComponent: { type: 'chevron' }
        },
        {
          icon: { component: <Info size={20} color={Colors.success} />, bgColor: Colors.success + "20" },
          title: "About",
          subtitle: "App version and information",
          onPress: () => openWebView("https://thingsnxt.vercel.app/", "About ThingsNXT"),
          rightComponent: { type: 'chevron' }
        },
      ],
    },
  ];


  // Reusable Section Component
  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <LinearGradient
        colors={isDarkTheme ? [Colors.surface, Colors.background] : ["#FFFFFF", "#F1F5F9"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]} // Adjust padding for safe area
      >
        <View style={styles.profileHeader}>
          {/* Profile Info (Left Side) - Now Tappable */}
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
            <View style={styles.profileInfoContainer}>
              <View style={[styles.avatar, { backgroundColor: Colors.primary + '30' }]}>
                <User size={32} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.profileName, { color: Colors.text }]}>
                  {username || 'User'}
                </Text>
                <Text style={[styles.profileEmail, { color: Colors.textSecondary }]}>
                  {email || 'user@example.com'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          {/* Logout Button (Right Side) */}
          <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout}>
            <LogOut size={24} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Render menu sections dynamically */}
        {menuSections.map((section) => (
          <SettingsSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <MenuItem
                key={item.title}
                {...item}
                Colors={Colors}
              />
            ))}
          </SettingsSection>
        ))}

        <Text style={[styles.version, { color: Colors.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        isDarkTheme={isDarkTheme}
        {...alertConfig}
      />

      {/* Data Export Modal */}
      <Modal
        visible={isExportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors.surface }]}>
            <Text style={[styles.modalTitle, { color: Colors.text }]}>Export Sensor Data</Text>
            <Text style={[styles.modalSubtitle, { color: Colors.textSecondary }]}>
              Select a time range for the data you want to export.
            </Text>

            <View style={styles.rangeContainer}>
              {[
                { key: "7d", label: "Last 7 Days" },
                { key: "30d", label: "Last 30 Days" },
                { key: "all", label: "All Time" },
              ].map((range) => (
                <Pressable
                  key={range.key}
                  style={[
                    styles.rangeOption,
                    { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
                    selectedRange === range.key && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                  ]}
                  onPress={() => setSelectedRange(range.key)}
                >
                  <Text style={[styles.rangeText, { color: Colors.text }, selectedRange === range.key && { color: Colors.white }]}>
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.surfaceLight }]}
                onPress={() => setExportModalVisible(false)}
                disabled={isExporting}
              >
                <Text style={[styles.modalBtnText, { color: Colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }, isExporting && { opacity: 0.7 }]}
                onPress={handleExportConfirm}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={[styles.modalBtnText, { color: Colors.white }]}>Export</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={isThemeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors.surface }]}>
            <Text style={[styles.modalTitle, { color: Colors.text }]}>Appearance</Text>
            
            <View style={{ gap: 8, marginBottom: 20 }}>
              {[
                { id: 'system', label: 'System Default' },
                { id: 'light', label: 'Light Mode' },
                { id: 'dark', label: 'Dark Mode' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.rangeOption, 
                    { flexDirection: 'row', justifyContent: 'space-between', borderColor: Colors.border, backgroundColor: Colors.surfaceLight },
                    themePreference === option.id && { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' }
                  ]}
                  onPress={() => handleThemeSelect(option.id)}
                >
                  <Text style={[styles.rangeText, { color: Colors.text }, themePreference === option.id && { color: Colors.primary }]}>
                    {option.label}
                  </Text>
                  {themePreference === option.id && <Check size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: Colors.surfaceLight }]}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: Colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // paddingTop will be set dynamically using insets.top
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space between profile info and logout button
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  headerLogoutButton: {
    padding: 8, // Add some padding for easier tapping
    // No specific background, let it be transparent
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  version: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  rangeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  rangeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
