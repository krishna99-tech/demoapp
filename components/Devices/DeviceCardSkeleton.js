import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Shimmer = ({ children, style, isDarkTheme }) => {
  const shimmerAnimatedValue = React.useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-350, 350],
  });

  const shimmerColor = isDarkTheme ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";

  return (
    <View style={style}>
      {children}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["transparent", shimmerColor, "transparent"]}
          style={{ flex: 1 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const DeviceCardSkeleton = ({ isDarkTheme, Colors }) => {
  return (
    <Shimmer style={[styles.deviceCard, { backgroundColor: Colors.surface, borderColor: Colors.border, overflow: 'hidden' }]} isDarkTheme={isDarkTheme}>
      <View style={styles.deviceCardContent}>
        <View style={[styles.deviceIcon, { backgroundColor: Colors.surfaceLight }]} />
        <View style={styles.deviceInfo}>
          <View style={{ height: 16, width: '70%', backgroundColor: Colors.surfaceLight, borderRadius: 8, marginBottom: 12 }} />
          <View style={{ height: 14, width: '40%', backgroundColor: Colors.surfaceLight, borderRadius: 8 }} />
        </View>
      </View>
    </Shimmer>
  );
};

const styles = StyleSheet.create({
  deviceCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  deviceCardContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  deviceIcon: { width: 56, height: 56, borderRadius: 14 },
  deviceInfo: { flex: 1, marginLeft: 16, gap: 4 },
});

export default React.memo(DeviceCardSkeleton);