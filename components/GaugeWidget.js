import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gauge } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // fallback if custom icon string is passed

// Fallback color object if @/constants/colors is missing
const Colors = {
  white: '#FFFFFF',
};

export default function GaugeWidget({ title, value, telemetry, icon }) {
  // --- Logic from Input 2: Animation ---
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // --- Logic from Input 2: Data Handling ---
  // Prioritize telemetry (real-time data) over static value
  const displayValue = telemetry !== undefined ? telemetry : value;
  
  // Ensure we have a number for the progress bar calculation
  const numericValue = typeof displayValue === 'number' 
    ? displayValue 
    : parseFloat(String(displayValue)) || 0;
    
  const percentage = Math.min(Math.max(numericValue, 0), 100);

  // Trigger animation when data changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [displayValue]); 

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {/* Render Lucide Gauge by default, or Ionicon if specific string name provided */}
            {typeof icon === 'string' ? (
              <Ionicons name={icon} size={24} color={Colors.white} />
            ) : (
              <Gauge size={24} color={Colors.white} />
            )}
          </View>
        </View>
        
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.percentage}>
            {/* Display raw value (which might be a string like "24°C") or rounded number */}
            {typeof displayValue === 'number' ? Math.round(displayValue) : displayValue}
            {typeof displayValue === 'number' && '%'} 
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Wrapper handles the external layout and animation spacing
  wrapper: {
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  container: {
    width: 160,
    height: 140,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContainer: {
    marginVertical: 8,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  title: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600',
  },
});