import React from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#1abc9c" }}
      contentContainerStyle={{ backgroundColor: "#eafaf1" }}
      text1Style={{ color: "#168f67", fontWeight: "bold" }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#e74c3c" }}
      text1Style={{ color: "#c0392b", fontWeight: "bold" }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#2980b9" }}
      contentContainerStyle={{ backgroundColor: "#ecf6fb" }}
      text1Style={{ color: "#2980b9" }}
    />
  ),
};

export function showToast({
  type = "success",
  text1 = "",
  text2 = "",
  position = "top",
  visibilityTime = 2500,
  ...rest
}) {
  Toast.show({
    type,
    text1,
    text2,
    position,
    visibilityTime,
    ...rest,
  });
}
showToast.success = (text1, text2, opts = {}) =>
  showToast({ type: "success", text1, text2, ...opts });
showToast.error = (text1, text2, opts = {}) =>
  showToast({ type: "error", text1, text2, ...opts });
showToast.info = (text1, text2, opts = {}) =>
  showToast({ type: "info", text1, text2, ...opts });

export default function ToastWrapper() {
  return <Toast config={toastConfig} />;
}