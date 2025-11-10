import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../screens/config";

console.log("Backend:", BASE_URL);

// 🟢 Enable layout animation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MainDashboardScreen() {
  // *** MAIN FIX: use userToken from context! ***
  const { userToken } = useContext(AuthContext);
  const navigation = useNavigation();

  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 🔹 Fetch dashboards
  const fetchDashboards = async () => {
    if (!userToken) {
      Alert.alert("Not Logged In", "Please login again.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dashboards`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDashboards(res.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      Alert.alert("Error", "Could not load dashboards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchDashboards();
      // Only refetch when userToken changes
    }, [userToken])
  );

  // 🔹 Add new dashboard
  const addDashboard = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Please enter a dashboard name");
      return;
    }
    if (!userToken) {
      Alert.alert("Not Logged In", "Cannot add dashboard—please login again.");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/dashboards`,
        { name: newName, description: newDescription },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDashboards((prev) => [...prev, res.data]);
      setModalVisible(false);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      // Backend may have more info in err.response?.data?.detail
      let msg = "Failed to create dashboard.";
      if (err.response && err.response.data && err.response.data.detail) {
        msg = err.response.data.detail;
      }
      console.error("Add dashboard error:", err);
      Alert.alert("Error", msg);
    }
  };

  // 🔹 Open dashboard details (update as needed)
  const openDashboard = (dashboard) => {
    navigation.navigate("Dashboard", { dashboard });
  };

  // 🔹 Animated Card Component
  const DashboardCard = ({ item }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () =>
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => openDashboard(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <LinearGradient
            colors={["#FF9A8B", "#FF6A88", "#FF99AC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </View>
            <Text style={styles.cardSubtitle}>
              {item.description || "No description provided"}
            </Text>
            <Text style={styles.cardDate}>
              Created: {new Date(item.created_at).toLocaleString()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient colors={["#FF6347", "#FF8264"]} style={styles.header}>
        <Text style={styles.title}>My Dashboards</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={36} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Dashboard List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={dashboards}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => <DashboardCard item={item} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, color: "#999" }}>
              No dashboards yet. Tap + to add one.
            </Text>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create Dashboard</Text>
            <TextInput
              style={styles.input}
              placeholder="Dashboard Name"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description (optional)"
              placeholderTextColor="#888"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={addDashboard}>
                <LinearGradient
                  colors={["#FF6347", "#FF8264"]}
                  style={styles.addBtnGradient}
                >
                  <Text style={styles.addText}>Add</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// 💅 STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" ,marginBottom:50 },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  title: { fontSize: 26, fontWeight: "bold", color: "#fff" },

  card: {
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  gradientCard: {
    borderRadius: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  cardSubtitle: { fontSize: 14, color: "#fff", opacity: 0.9, marginTop: 6 },
  cardDate: { fontSize: 12, color: "#fff", opacity: 0.7, marginTop: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 18,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    backgroundColor: "#fafafa",
    color: "#111",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelBtn: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelText: { color: "#888", fontSize: 16 },
  addBtn: { borderRadius: 10, overflow: "hidden" },
  addBtnGradient: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
});
