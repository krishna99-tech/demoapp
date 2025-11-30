import React, { useContext } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Moon,
  Sun,
  Shield,
  Smartphone,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { logout, username, isDarkTheme, toggleTheme } = useContext(AuthContext);

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
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("Error", "Cannot open the link right now.");
  };

  const handleComingSoon = (title) => {
    Alert.alert(title, "Feature coming soon 🚀");
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <LinearGradient
        colors={isDarkTheme ? [Colors.background, Colors.surface] : ["#FFFFFF", "#F1F5F9"]}
        style={styles.header}
      >
        <Text style={[styles.title, { color: Colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>Manage your preferences</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Account</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={() => handleComingSoon("Profile")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primary + "20" }]}>
                <User size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>Profile</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>
                  {username || "Edit your personal information"}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={() => handleComingSoon("Security")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.success + "20" }]}>
                <Shield size={20} color={Colors.success} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>Security</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>Password and authentication</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Preferences</Text>

          <View style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.warning + "20" }]}>
                {isDarkTheme ? <Moon size={20} color={Colors.warning} /> : <Sun size={20} color={Colors.warning} />}
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>Dark Mode</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>
                  {isDarkTheme ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={() => handleComingSoon("Connected Devices")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.secondary + "20" }]}>
                <Smartphone size={20} color={Colors.secondary} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>Connected Devices</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>Manage connected devices</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Support</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={() => openLink("https://thingsnxt.vercel.app/support")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primary + "20" }]}>
                <HelpCircle size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>Help Center</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>FAQs and support articles</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={() => openLink("https://thingsnxt.vercel.app/")}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.success + "20" }]}>
                <Info size={20} color={Colors.success} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: Colors.text }]}>About</Text>
                <Text style={[styles.menuItemSubtitle, { color: Colors.textMuted }]}>App version and information</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: Colors.surface, borderColor: Colors.danger }]} onPress={handleLogout}>
            <LogOut size={20} color={Colors.danger} />
            <Text style={[styles.logoutText, { color: Colors.danger }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: Colors.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});

