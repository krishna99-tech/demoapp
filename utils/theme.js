/**
 * Centralized theme utilities for consistent color usage across the app
 * This helps avoid duplication and ensures consistent theming
 */

/**
 * Get theme colors based on dark/light mode
 * @param {boolean} isDarkTheme - Whether dark theme is active
 * @returns {Object} Theme colors object
 */
export function getThemeColors(isDarkTheme = false) {
  return {
    // Background colors
    background: isDarkTheme ? "#0A0E27" : "#F1F5F9",
    surface: isDarkTheme ? "#1A1F3A" : "#FFFFFF",
    surfaceLight: isDarkTheme ? "#252B4A" : "#E2E8F0",
    border: isDarkTheme ? "#252B4A" : "#E2E8F0",
    
    // Primary colors
    primary: isDarkTheme ? "#00D9FF" : "#3B82F6",
    primaryDark: isDarkTheme ? "#00B5D4" : "#2563EB",
    secondary: isDarkTheme ? "#7B61FF" : "#6D28D9",
    
    // Status colors
    success: isDarkTheme ? "#00FF88" : "#16A34A",
    warning: isDarkTheme ? "#FFB800" : "#F59E0B",
    danger: isDarkTheme ? "#FF3366" : "#DC2626",
    info: isDarkTheme ? "#00D9FF" : "#17a2b8",
    
    // Status indicators
    statusOnline: "#00FF88",
    statusOffline: "#FF3366",
    statusWarning: "#FFB800",
    
    // Text colors
    text: isDarkTheme ? "#FFFFFF" : "#1E293B",
    textSecondary: isDarkTheme ? "#8B91A7" : "#64748B",
    textMuted: isDarkTheme ? "#8B91A7" : "#64748B",
    
    // Utility colors
    white: "#FFFFFF",
    black: "#000000",
  };
}

/**
 * Get modal/overlay colors
 * @param {boolean} isDarkTheme - Whether dark theme is active
 * @returns {Object} Modal colors
 */
export function getModalColors(isDarkTheme = false) {
  return {
    background: isDarkTheme ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    card: isDarkTheme ? '#1A1F3A' : '#FFFFFF',
    title: isDarkTheme ? '#FFFFFF' : '#1E293B',
    message: isDarkTheme ? '#8B91A7' : '#64748B',
    buttonText: isDarkTheme ? '#FFFFFF' : '#1E293B',
    surfaceLight: isDarkTheme ? '#252B4A' : '#E2E8F0',
  };
}

/**
 * Get toast colors
 * @param {boolean} isDarkTheme - Whether dark theme is active
 * @returns {Object} Toast colors
 */
export function getToastColors(isDarkTheme = false) {
  return {
    card: isDarkTheme ? "#1A1F3A" : "#FFFFFF",
    text: isDarkTheme ? "#FFFFFF" : "#1E293B",
    textSecondary: isDarkTheme ? "#8B91A7" : "#64748B",
    success: "#28a745",
    error: "#dc3545",
    info: "#17a2b8",
    successBg: isDarkTheme ? "rgba(40, 167, 69, 0.2)" : "#eafaf1",
    errorBg: isDarkTheme ? "rgba(220, 53, 69, 0.2)" : "#fdeded",
    infoBg: isDarkTheme ? "rgba(23, 162, 184, 0.2)" : "#ecf6fb",
  };
}

