import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius, space, typography, elevation } from '../tokens';

export interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 3000 }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, justifyContent: 'flex-end' },
  container: { width: '100%', paddingHorizontal: space[6], paddingBottom: space[8], alignItems: 'center' },
  toast: {
    backgroundColor: colors.ink,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderRadius: radius.pill,
    ...elevation.floating,
  },
  message: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.scale.bodySmall.size,
    color: colors.ivory,
  },
});
