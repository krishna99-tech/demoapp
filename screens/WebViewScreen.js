import React, { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Share } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { Share2 } from "lucide-react-native"; // Import a share icon

// A simple loading component
const LoadingIndicator = ({ isDarkTheme, Colors }) => (
  <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

export default function WebViewScreen({ route, navigation }) {
  const { url, title } = route.params;
  const { isDarkTheme } = useAuth();
  const insets = useSafeAreaInsets();

  // Define theme-aware colors
  const Colors = useMemo(() => ({
    background: isDarkTheme ? "#0A0E27" : "#F1F5F9",
    primary: isDarkTheme ? "#00D9FF" : "#3B82F6",
    text: isDarkTheme ? "#FFFFFF" : "#1E293B", // Add text color for icon
  }), [isDarkTheme]);

  // Set the header title for the screen
  React.useLayoutEffect(() => {
    // Function to handle sharing, defined inside useLayoutEffect to capture current props/state
    const onShare = async () => {
      try {
        const result = await Share.share({
          message: `Check out this page: ${title || 'Web Page'} - ${url}`,
          url: url, // For iOS, provide the URL directly
          title: title || 'Share Web Page', // For Android, title for the share dialog
        });
        if (result.action === Share.sharedAction) {
          // shared
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        console.error('Error sharing:', error.message);
        // Optionally show a toast or alert
      }
    };

    navigation.setOptions({
      title: title || "WebView",
      headerTintColor: Colors.text, // Color for back button and title
      headerStyle: {
        backgroundColor: Colors.background, // Background color for the header
      },
      headerRight: () => (
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Share2 size={24} color={Colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, url, Colors]); // Dependencies for useLayoutEffect

  return (
    <View style={[styles.container, { backgroundColor: Colors.background, paddingTop: insets.top }]}>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => <LoadingIndicator isDarkTheme={isDarkTheme} Colors={Colors} />}
        style={[styles.webview, { backgroundColor: Colors.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    marginRight: 10, // Adjust as needed for spacing from the edge
    padding: 5, // Make it easier to tap
  },
});
