import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import {
  User,
  Mail,
  Edit,
  Save,
  X,
  Shield,
  Trash2,
  Calendar,
  Cpu,
  Wifi,
  LayoutDashboard,
  Hash,
  CheckCircle
} from 'lucide-react-native';

import CustomAlert from '../components/CustomAlert';
import StatCard from '../components/profile/StatCard';
import ProfileInfoRow from '../components/profile/ProfileInfoRow';
import api from '../services/api';

// Utility
const alpha = (hex, opacity) => {
  const o = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return hex + o;
};

// Reference height for header animation
const HEADER_HEIGHT = 220;

// Helper to ensure dates are treated as UTC if missing timezone info
const parseDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
    return new Date(date + 'Z');
  }
  return new Date(date);
};

const getDeviceStatus = (device) => {
  if (!device) return "offline";
  
  // Check last_active with 60s threshold
  if (device.last_active) {
    const lastActive = parseDate(device.last_active);
    const now = new Date();
    const secondsSinceActive = (now - lastActive) / 1000;
    
    if (secondsSinceActive <= 60) {
      return "online";
    } else if (device.status === "online") {
      return "offline"; // Override if stale
    }
  }
  
  return device.status || "offline";
};

export default function ProfileScreen({ navigation }) {
  const {
    user,
    username,
    email,
    devices,
    isDarkTheme,
    updateUser,
    deleteAccount
  } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username || "");
  const [editedEmail, setEditedEmail] = useState(email || "");
  const [editedFullName, setEditedFullName] = useState(user?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dashboardCount, setDashboardCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const scrollY = useRef(new Animated.Value(0)).current;

  const Colors = {
    background: isDarkTheme ? "#0A0E27" : "#F1F5F9",
    surface: isDarkTheme ? "#1A1F3A" : "#FFFFFF",
    surfaceLight: isDarkTheme ? "#252B4A" : "#E2E8F0",
    border: isDarkTheme ? "#252B4A" : "#E2E8F0",
    primary: isDarkTheme ? "#00D9FF" : "#3B82F6",
    success: isDarkTheme ? "#00FF88" : "#16A34A",
    warning: isDarkTheme ? "#FFB800" : "#F59E0B",
    danger: isDarkTheme ? "#FF3366" : "#DC2626",
    white: "#FFFFFF",
    text: isDarkTheme ? "#FFFFFF" : "#1E293B",
    textSecondary: isDarkTheme ? "#8B91A7" : "#64748B",
    textMuted: isDarkTheme ? "#8B91A7" : "#64748B",
  };

  // Animations
  const avatarScale = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const nameTranslateY = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const nameScale = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  // FIXED: Reset ONLY when NOT editing
  useEffect(() => {
    if (!isEditing) {
      setEditedUsername(username || "");
      setEditedEmail(email || "");
      setEditedFullName(user?.full_name || "");
      setHasChanges(false);
    }
  }, [username, email, user?.full_name, isEditing]);

  // Load dashboard count
  useEffect(() => {
    const loadDashboards = async () => {
      try {
        setLoadingStats(true);
        const dashboards = await api.getDashboards();
        setDashboardCount(dashboards?.length || 0);
      } catch (err) {
        console.log("Dashboard load error:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadDashboards();
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(
      editedUsername !== username || 
      editedEmail !== email || 
      editedFullName !== (user?.full_name || "")
    );
  }, [editedUsername, editedEmail, editedFullName, username, email, user?.full_name]);

  const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSave = async () => {
    if (isSaving || !hasChanges) return;

    if (!editedUsername.trim()) {
      setAlertConfig({
        type: "warning",
        title: "Invalid Input",
        message: "Username cannot be empty.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
      return;
    }
    if (!isEmailValid(editedEmail)) {
      setAlertConfig({
        type: "warning",
        title: "Invalid Input",
        message: "Please enter a valid email address.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
      return;
    }

    setIsSaving(true);
    try {
      const updates = {};
      if (editedUsername !== username) updates.username = editedUsername;
      if (editedEmail !== email) updates.email = editedEmail;
      if (editedFullName !== (user?.full_name || "")) updates.full_name = editedFullName;

      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
      }

      // FIXED: Exit editing mode BEFORE context update completes
      setIsEditing(false);
      
      setAlertConfig({
        type: "success",
        title: "Profile Updated",
        message: "Your changes have been saved.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
    } catch (err) {
      setAlertConfig({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to update profile.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }]
      });
      setAlertVisible(true);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedUsername(username || "");
    setEditedEmail(email || "");
    setEditedFullName(user?.full_name || "");
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleDeleteAccount = () => {
    setAlertConfig({
      type: "confirm",
      title: "Delete Account",
      message: "Are you sure you want to permanently delete your account? This action cannot be undone.",
      buttons: [
        { text: "Cancel", style: "cancel", onPress: () => setAlertVisible(false) },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteAccount();
          }
        }
      ]
    });
    setAlertVisible(true);
  };


  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Collapsing profile header */}
      <Animated.View style={[styles.headerWrapper, {
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, HEADER_HEIGHT],
            outputRange: [0, -HEADER_HEIGHT],
            extrapolate: 'clamp',
          })
        }]
      }]}>
        <View style={[styles.headerCard, { backgroundColor: Colors.surface }]}>
          <Animated.View
            style={[
              styles.avatar,
              {
                backgroundColor: alpha(Colors.primary, 0.25),
                transform: [
                  { translateY: avatarTranslateY },
                  { scale: avatarScale },
                ],
              }
            ]}
          >
            <User size={64} color={Colors.primary} />
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                { translateY: nameTranslateY },
                { scale: nameScale },
              ],
            }}
          >
            <Text style={[styles.profileName, { color: Colors.text }]}>
              {isEditing ? editedFullName || editedUsername : (user?.full_name || username || "User")}
            </Text>
            <Text style={[styles.profileRole, { color: Colors.textSecondary }]}>
              {user?.full_name ? `@${username || "user"}` : "Administrator"}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Stats cards */}
        <View style={styles.statsSection}>
          <StatCard
            icon={<Calendar size={20} color={Colors.primary} />}
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })
                : 'N/A'
            }
            label="Member Since"
            colors={[alpha(Colors.primary, 0.35), alpha(Colors.primary, 0.10)]}
            isDarkTheme={isDarkTheme}
          />

          <StatCard
            icon={<Cpu size={20} color={Colors.success} />}
            value={devices?.length || 0}
            label="Total Devices"
            colors={[alpha(Colors.success, 0.35), alpha(Colors.success, 0.10)]}
            isDarkTheme={isDarkTheme}
          />

          <StatCard
            icon={<Wifi size={20} color={Colors.warning} />}
            value={devices?.filter(d => getDeviceStatus(d) === "online").length || 0}
            label="Online Devices"
            colors={[alpha(Colors.warning, 0.35), alpha(Colors.warning, 0.10)]}
            isDarkTheme={isDarkTheme}
          />

          <StatCard
            icon={<LayoutDashboard size={20} color={Colors.danger} />}
            value={dashboardCount}
            loading={loadingStats}
            label="Dashboards"
            colors={[alpha(Colors.danger, 0.35), alpha(Colors.danger, 0.10)]}
            isDarkTheme={isDarkTheme}
          />
        </View>

        {/* Profile edit section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: Colors.textSecondary }]}>
            Profile details
          </Text>

          {!isEditing && (
            <TouchableOpacity
              style={styles.inlineEditBtn}
              onPress={() => setIsEditing(true)}
            >
              <Edit size={16} color={Colors.textSecondary} />
              <Text style={[styles.inlineEditText, { color: Colors.textSecondary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: Colors.surface }]}>
          <ProfileInfoRow
            icon={<User size={20} color={Colors.primary} />}
            label="Full Name"
            value={editedFullName}
            Colors={Colors}
            isEditing={isEditing}
            onChangeText={setEditedFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <ProfileInfoRow
            icon={<User size={20} color={Colors.primary} />}
            label="Username"
            value={editedUsername}
            Colors={Colors}
            isEditing={isEditing}
            onChangeText={setEditedUsername}
            placeholder="Enter username"
            autoCapitalize="none"
          />

          <ProfileInfoRow
            icon={<Mail size={20} color={Colors.primary} />}
            label="Email"
            value={editedEmail}
            Colors={Colors}
            isEditing={isEditing}
            onChangeText={setEditedEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {!isEditing && user?.id && (
            <ProfileInfoRow
              icon={<Hash size={20} color={Colors.textSecondary} />}
              label="User ID"
              value={user.id}
              Colors={Colors}
              isEditing={false}
              editable={false}
            />
          )}

          {!isEditing && (
            <ProfileInfoRow
              icon={<CheckCircle size={20} color={user?.is_active ? Colors.success : Colors.textSecondary} />}
              label="Account Status"
              value={user?.is_active ? "Active" : "Inactive"}
              Colors={Colors}
              isEditing={false}
              editable={false}
            />
          )}

          {isEditing && (
            <View style={styles.inlineActionsRow}>
              <TouchableOpacity
                style={[styles.inlineActionButton, { backgroundColor: Colors.surfaceLight }]}
                onPress={handleCancel}
              >
                <X size={16} color={Colors.text} />
                <Text style={[styles.inlineActionText, { color: Colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.inlineActionButton,
                  { backgroundColor: Colors.primary },
                  (!hasChanges || isSaving) && styles.buttonDisabled
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFF" />
                    <Text style={styles.inlineActionText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>
            Security
          </Text>

          <View style={[styles.card, { backgroundColor: Colors.surface }]}>
            <TouchableOpacity
              style={styles.securityRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Shield size={20} color={Colors.textSecondary} />
              <Text style={[styles.securityRowText, { color: Colors.text }]}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>
            Danger Zone
          </Text>

          <View style={[styles.card, { backgroundColor: Colors.surface }]}>
            <TouchableOpacity style={styles.securityRow} onPress={handleDeleteAccount}>
              <Trash2 size={20} color={Colors.danger} />
              <Text style={[styles.securityRowText, { color: Colors.danger }]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomAlert
          visible={alertVisible}
          isDarkTheme={isDarkTheme}
          {...alertConfig}
        />
      </Animated.ScrollView>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    alignItems: 'center',
    zIndex: 10,
    paddingTop: 40,
  },

  headerCard: {
    width: '92%',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '700',
  },

  profileRole: {
    fontSize: 14,
    marginTop: 4,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },

  sectionHeaderRow: {
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  inlineEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  inlineEditText: {
    fontSize: 13,
    fontWeight: '500',
  },

  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },


  inlineActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000020',
  },

  inlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },

  inlineActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  section: {
    marginHorizontal: 20,
    marginTop: 32,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },

  securityRowText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
