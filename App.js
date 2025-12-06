import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AuthProvider } from "./context/AuthContext";
import ToastWrapper from "./components/Toast"; // Changed import to custom wrapper
import AnimatedSplashScreen from "./components/AnimatedSplashScreen";
import RootNavigator from "./AppNavigator";


export default function App() {
  return (
    <AuthProvider>
      <AnimatedSplashScreen>
        <RootNavigator />
      </AnimatedSplashScreen>
      <ToastWrapper />
    </AuthProvider>
  );
}
