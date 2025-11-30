import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AuthProvider } from "./context/AuthContext";
import ToastWrapper from "./components/Toast"; // Changed import to custom wrapper
import RootNavigator from "./AppNavigator";
import "./debug-text-patch"; // Ensure this is imported to apply the patch

export default function App() {
  return (
    <LinearGradient colors={["#fdfbfb", "#ebedee"]} style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator /> 
        <ToastWrapper /> {/* Render custom wrapper */}
      </AuthProvider>
    </LinearGradient>
  );
}
