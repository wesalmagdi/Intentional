import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { colors, radius, space, typography, elevation } from '../tokens';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
          )}
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(36, 35, 33, 0.4)' },
  container: { width: '100%' },
  sheet: {
    width: '100%',
    backgroundColor: colors.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space[6],
    paddingBottom: space[8],
    ...elevation.floating,
    gap: space[4],
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space[2],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontFamily: typography.families.display,
    fontSize: typography.scale.heading.size,
    color: colors.ink,
  },
  close: { fontSize: 18, color: colors.grey, padding: space[2] },
});
