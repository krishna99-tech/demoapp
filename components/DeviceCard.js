import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme';
import { Swipeable } from 'react-native-gesture-handler';

const ICONS = {
  thermostat: 'thermometer',
  plug: 'power-plug',
  light: 'lightbulb-on',
  door: 'door-closed',
  default: 'chip',
};

const renderRightActions = (progress, dragX, onPress) => {
  const trans = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteButton}>
      <Animated.View style={[styles.deleteButtonView, { transform: [{ translateX: trans }] }]}>
        <Ionicons name="trash-outline" size={24} color={COLORS.card} />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const renderLeftActions = (progress, dragX, onPress) => {
  const trans = dragX.interpolate({
    inputRange: [0, 80],
    outputRange: [-80, 0],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.editButton}>
      <Animated.View style={[styles.editButtonView, { transform: [{ translateX: trans }] }]}>
        <Ionicons name="create-outline" size={24} color={COLORS.card} />
        <Text style={styles.deleteText}>Edit</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const DeviceCard = ({ device, onPress, onEdit, onDelete, isDarkTheme }) => {
  const isOnline = device.status === 'online';
  const iconName = ICONS[device.type] || ICONS.default;

  return (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, onDelete)}
      renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, onEdit)}
      overshootRight={false}
    >
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.iconContainer, { backgroundColor: isOnline ? `${COLORS.primary}20` : `${COLORS.textSecondary}20` }]}>
          <MaterialCommunityIcons 
            name={iconName} 
            size={28} 
            color={isOnline ? COLORS.primary : COLORS.textSecondary} 
          />
        </View>
        <View style={styles.detailsContainer} >
          <Text style={styles.deviceName}>{device.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? COLORS.online : COLORS.offline }]} />
            <Text style={[styles.deviceStatus, { color: isOnline ? COLORS.online : COLORS.offline }]}>
              {device.status}
            </Text>
          </View>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.deviceValue}>{device.value}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: SIZES.padding,
    marginVertical: SIZES.base,
    marginHorizontal: SIZES.base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card, // Ensure card has a background color
  },
  iconContainer: { 
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
    color: '#fff',
  },
  detailsContainer: { flex: 1 },
  deviceName: { ...FONTS.h3, fontSize: 16, marginBottom: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  deviceStatus: { ...FONTS.body, textTransform: 'capitalize', fontSize: 12 },
  valueContainer: { marginLeft: SIZES.padding, alignItems: 'flex-end' },
  deviceValue: { ...FONTS.h3, fontSize: 16 },
  deleteButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.base,
  },
  deleteButtonView: {
    flex: 1,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
  },
  editButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.base,
  },
  editButtonView: {
    flex: 1,
    backgroundColor: '#3498db', // A nice blue for edit
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
  },
  deleteText: {
    color: COLORS.card,
    fontSize: 12,
    marginTop: 4,
  },
});

export default DeviceCard;