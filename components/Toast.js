import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { CheckCircle, XCircle, Info } from "lucide-react-native";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getToastColors } from "../utils/theme";

const CustomToast = ({ text1, text2, type, props }) => {
  const { isDarkTheme } = props;
  const Colors = getToastColors(isDarkTheme);

  const ICONS = {
    success: <CheckCircle size={24} color={Colors.success} />,
    error: <XCircle size={24} color={Colors.error} />,
    info: <Info size={24} color={Colors.info} />,
  };

  const BORDER_COLORS = {
    success: Colors.success,
    error: Colors.error,
    info: Colors.info,
  };

  const BACKGROUND_COLORS = {
    success: Colors.successBg,
    error: Colors.errorBg,
    info: Colors.infoBg,
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: BACKGROUND_COLORS[type],
          borderColor: BORDER_COLORS[type],
        },
      ]}
    >
      <View style={styles.iconContainer}>{ICONS[type]}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { color: Colors.text }]}>{text1}</Text>
        {text2 && (
          <Text style={[styles.text2, { color: Colors.textSecondary }]}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

const toastConfig = {
  success: ({ text1, text2, props }) => (
    <CustomToast text1={text1} text2={text2} type="success" props={props} />
  ),
  error: ({ text1, text2, props }) => (
    <CustomToast text1={text1} text2={text2} type="error" props={props} />
  ),
  info: ({ text1, text2, props }) => (
    <CustomToast text1={text1} text2={text2} type="info" props={props} />
  ),
};

// Store the current theme for toast calls that don't provide it
let currentTheme = false;

export function showToast({
  type = "success",
  text1 = "",
  text2 = "",
  position = "top",
  visibilityTime = 2500,
  isDarkTheme,
  ...rest
}) {
  // Use provided theme or fall back to stored theme
  const theme = isDarkTheme !== undefined ? isDarkTheme : currentTheme;
  Toast.show({
    type,
    props: { isDarkTheme: theme },
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
  const { isDarkTheme } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  // Update the stored theme whenever it changes
  useEffect(() => {
    currentTheme = isDarkTheme;
  }, [isDarkTheme]);

  return (
    <Toast
      config={toastConfig}
      topOffset={insets.top + 10}
      props={{ isDarkTheme }} // Pass theme to all toasts
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
  },
});