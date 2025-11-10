import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  Vibration,
  TouchableOpacity,
  Animated,
  ScrollView,
  LogBox,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // <-- Added
import { AuthContext } from "../context/AuthContext";

LogBox.ignoreLogs(["setLayoutAnimationEnabledExperimental"]);

export default function SettingsScreen() {
  const { logout, username, isDarkTheme, toggleTheme } = useContext(AuthContext);
  const [language, setLanguage] = useState("en");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation(); // <-- Added

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const textColor = isDarkTheme ? "#f1f1f1" : "#111";
  const cardColor = isDarkTheme ? "#1e1e1e" : "#fafafa";
  const borderColor = isDarkTheme ? "#333" : "#ddd";

  // 🔘 Theme Toggle
  const handleThemeChange = () => {
    Vibration.vibrate(40);
    toggleTheme();
    Alert.alert("Theme Changed", `Switched to ${!isDarkTheme ? "Dark" : "Light"} Mode.`);
  };

  // 🔘 Logout confirmation
  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          Vibration.vibrate(60);
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  // 🔘 Common alert placeholder
  const handleCardPress = (title) => {
    Vibration.vibrate(20);
    Alert.alert(title, "Feature coming soon 🚀");
  };

  return (
    <LinearGradient
      colors={
        isDarkTheme
          ? ["#0f2027", "#203a43", "#2c5364"]
          : ["#e0f7fa", "#f1f8ff", "#ffffff"]
      }
      style={styles.container}
    >
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: textColor }]}>Settings ⚙️</Text>

        {/* 👤 Profile */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleCardPress("Profile")}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="person-circle-outline" size={38} color="#4fc3f7" />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Profile</Text>
              <Text style={[styles.cardSubtitle, { color: "#999" }]}>
                {username ?? "User"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 🌗 Theme Toggle */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons
            name={isDarkTheme ? "moon" : "sunny-outline"}
            size={36}
            color={isDarkTheme ? "#ffca28" : "#007bff"}
          />
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Theme</Text>
            <Text style={[styles.cardSubtitle, { color: "#999" }]}>
              {isDarkTheme ? "Dark Mode" : "Light Mode"}
            </Text>
          </View>
          <Switch value={isDarkTheme} onValueChange={handleThemeChange} />
        </View>

        {/* 🌐 Language Selector */}
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="language-outline" size={34} color="#81d4fa" />
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Language</Text>
            <Picker
              selectedValue={language}
              style={[styles.picker, { color: textColor }]}
              dropdownIconColor={isDarkTheme ? "#fff" : "#000"}
              onValueChange={(val) => setLanguage(val)}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="हिन्दी (Hindi)" value="hi" />
              <Picker.Item label="தமிழ் (Tamil)" value="ta" />
              <Picker.Item label="తెలుగు (Telugu)" value="te" />
            </Picker>
          </View>
        </View>

        {/* 🔔 Notifications */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleCardPress("Notifications")}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="notifications-outline" size={34} color="#ffb74d" />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Notifications</Text>
              <Text style={[styles.cardSubtitle, { color: "#999" }]}>
                Manage your alerts
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 🆘 Help & Support */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleCardPress("Help & Support")}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="help-circle-outline" size={34} color="#64b5f6" />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Help & Support</Text>
              <Text style={[styles.cardSubtitle, { color: "#999" }]}>
                Get assistance or report a problem
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 💬 Feedback */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleCardPress("Feedback")}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="chatbox-ellipses-outline" size={34} color="#81c784" />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Feedback</Text>
              <Text style={[styles.cardSubtitle, { color: "#999" }]}>
                Share your thoughts
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 🚪 Logout */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleLogout} style={styles.logoutButton}>
          <LinearGradient colors={["#ff5252", "#d32f2f"]} style={styles.logoutGradient}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[styles.footer, { color: textColor }]}>
          © 2025 Electro Gadgedc • ThingsNXT v1.0
        </Text>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    marginTop: 80,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 18, fontWeight: "600" },
  cardSubtitle: { fontSize: 14, marginTop: 3 },
  picker: { width: 170, height: 40 },
  logoutButton: { width: "90%", marginTop: 25 },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 20,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 18, marginLeft: 8 },
  footer: { marginTop: 25, fontSize: 12 },
});
