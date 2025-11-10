import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function SignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);

  const updateFormData = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ✨ Signup with NO auto-login!
  const handleSignup = async () => {
    const { email, username, password, confirmPassword, full_name } = formData;

    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!validateUsername(username)) {
      Alert.alert(
        "Invalid Username",
        "Username can only contain letters, numbers, and underscores."
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password,
        full_name: full_name.trim() || null,
      };
      const res = await api.signup(payload);

      // 🚫 DO NOT auto-login! Don't store tokens or push authenticated screens.
      if (res?.access_token) {
        Alert.alert(
          "Signup Successful!",
          "Your account has been created. Please log in with your new credentials."
        );
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } else {
        throw new Error(
          res?.detail ||
            "Unexpected server response: Signup succeeded but no token returned."
        );
      }
    } catch (error) {
      console.error("❌ Signup error caught:", error);
      if (
        error.message?.includes("already registered") ||
        error.message?.includes("409")
      ) {
        Alert.alert("Account Exists", "Username or email already registered.");
      } else if (
        error.message?.includes("Invalid JSON") ||
        error.message?.includes("500")
      ) {
        Alert.alert(
          "Server Error",
          "Backend issue—try again or contact support."
        );
      } else if (error.message?.includes("Network error")) {
        Alert.alert("Network Error", "Check your connection and try again.");
      } else {
        Alert.alert("Signup Failed", error.message || "Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (key) => [
    styles.input,
    focusedInput === key && styles.inputFocused,
  ];

  return (
    <LinearGradient colors={["#007AFF", "#004E92"]} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              {/* ... all your fields ... */}

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name (Optional)</Text>
                <TextInput
                  style={inputStyle("full_name")}
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onFocus={() => setFocusedInput("full_name")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(text) => updateFormData("full_name", text)}
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={inputStyle("username")}
                  placeholder="Choose a username"
                  value={formData.username}
                  onFocus={() => setFocusedInput("username")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(text) => updateFormData("username", text)}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={inputStyle("email")}
                  placeholder="Enter your email"
                  value={formData.email}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(text) => updateFormData("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    value={formData.password}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    onChangeText={(text) => updateFormData("password", text)}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={inputStyle("confirmPassword")}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(text) =>
                    updateFormData("confirmPassword", text)
                  }
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: { fontSize: 30, fontWeight: "bold", color: "#222", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  inputFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 16, color: "#333" },
  eyeButton: { paddingHorizontal: 12 },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: { color: "#444" },
  linkText: { color: "#007AFF", fontWeight: "700" },
});
