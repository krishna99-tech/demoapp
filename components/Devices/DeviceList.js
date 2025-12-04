import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import DeviceCard from "./DeviceCard";
import DeviceCardSkeleton from "./DeviceCardSkeleton";

// Component shown when list is empty
const EmptyListComponent = ({ Colors }) => (
  <View style={styles.emptyContainer}>
    <Text style={[styles.emptyText, { color: Colors.text }]}>No Devices Found</Text>
    <Text style={[styles.emptySubText, { color: Colors.textMuted }]}>
      You can add a new device from the settings screen.
    </Text>
  </View>
);

export const DeviceList = ({
  devices,
  onRefresh,
  refreshing,   // <-- this is correct
  onPress,
  onEdit,
  onDelete,
  isDarkTheme,
  Colors,
}) => {
  // Show skeletons on initial load (refreshing is true but no devices yet)
  if (refreshing && devices.length === 0) {
    return (
      <View style={styles.listContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <DeviceCardSkeleton key={index} isDarkTheme={isDarkTheme} Colors={Colors} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={devices}
      renderItem={({ item }) => (
        <DeviceCard
          isDarkTheme={isDarkTheme}
          device={item}
          onPress={() => onPress(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      )}
      keyExtractor={(item) => String(item.id || item._id)}
      ListEmptyComponent={<EmptyListComponent Colors={Colors} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: { fontSize: 18, fontWeight: "bold" },
  emptySubText: { fontSize: 14, marginTop: 8 },
});
