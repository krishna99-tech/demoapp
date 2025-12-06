import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { Asset } from 'expo-asset';
import { User } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Pre-load any assets you need for the splash screen or initial app load
const loadAssetsAsync = async () => {
  const images = [require('../assets/icon.png')]; // Example: your app icon
  const cacheImages = images.map(image => {
    return Asset.fromModule(image).downloadAsync();
  });
  return Promise.all(cacheImages);
};

export default function AnimatedSplashScreen({ children }) {
  const [isAppReady, setAppReady] = useState(false);
  const { loading: isAuthLoading } = useAuth(); // Get auth loading status

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    async function prepare() {
      try {
        await loadAssetsAsync();
        // Any other pre-loading tasks can go here
      } catch (e) {
        console.warn(e);
      } finally {
        // We are not setting app ready here, we wait for auth to finish
      }
    }
    prepare();
  }, []);

  // This effect runs when the auth state is no longer loading
  useEffect(() => {
    if (!isAuthLoading) {
      setAppReady(true);
    }
  }, [isAuthLoading]);

  const onAnimationFinish = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  useEffect(() => {
    if (isAppReady) {
      // Fade out the splash screen container
      opacity.value = withTiming(0, { duration: 300 });
      // Scale down the logo
      scale.value = withTiming(0.5, { duration: 300 }, () => {
        // Hide the native splash screen after the animation is done
        runOnJS(onAnimationFinish)();
      });
    }
  }, [isAppReady, onAnimationFinish]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      {children}
      {/* Splash Screen Animation Overlay */}
      {!isAppReady && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.splashContainer, animatedStyle]}
        >
          <User size={120} color="#00D9FF" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#0A0E27', // Dark theme background
    alignItems: 'center',
    justifyContent: 'center',
  },
});
