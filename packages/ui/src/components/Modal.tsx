import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { colors, radius, space, typography, elevation } from '../tokens';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.card}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(36, 35, 33, 0.4)' },
  container: { width: '100%', paddingHorizontal: space[6], alignItems: 'center' },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: colors.elevated,
    borderRadius: radius.lg,
    padding: space[6],
    ...elevation.floating,
    gap: space[4],
  },
  title: {
    fontFamily: typography.families.display,
    fontSize: typography.scale.heading.size,
    color: colors.ink,
    textAlign: 'center',
  },
});
