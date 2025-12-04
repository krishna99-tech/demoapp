import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const ProfileInfoRow = ({
  icon,
  label,
  value,
  Colors,
  onPress
}) => (
  <TouchableOpacity
    style={[styles.infoRow, { borderBottomColor: Colors.border }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1} // Only show touch feedback if it's pressable
    disabled={!onPress}
  >
    <View style={styles.infoIcon}>{icon}</View>

    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: Colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
    {onPress && <ChevronRight size={20} color={Colors.textMuted} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  infoRow: { flexDirection: "row", padding: 20, alignItems: 'center' },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 16 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 16, fontWeight: "600" },
});

export default ProfileInfoRow;