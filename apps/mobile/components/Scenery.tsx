import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Polygon, Path } from 'react-native-svg';
import { colors } from '@intentional/ui';

const STARS = [
  { x: 40, y: 90, r: 1.4, o: 0.5 }, { x: 120, y: 60, r: 1, o: 0.35 }, { x: 210, y: 110, r: 1.6, o: 0.55 },
  { x: 300, y: 70, r: 1, o: 0.4 }, { x: 360, y: 150, r: 1.3, o: 0.5 }, { x: 80, y: 200, r: 1, o: 0.3 },
  { x: 260, y: 220, r: 1.2, o: 0.4 }, { x: 170, y: 300, r: 1, o: 0.3 }, { x: 340, y: 320, r: 1.4, o: 0.45 },
  { x: 50, y: 380, r: 1, o: 0.3 },
];

export function MountainDusk() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">
        {STARS.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={colors.cream} opacity={s.o} />)}
        <Circle cx={318} cy={150} r={52} fill={colors.copperSoft} opacity={0.10} />
        <Circle cx={318} cy={150} r={26} fill={colors.cream} opacity={0.10} />
        <Polygon points="0,565 85,470 165,540 255,450 335,530 400,478 400,800 0,800" fill="#251E15" opacity={0.9} />
        <Polygon points="0,625 70,562 150,612 240,542 320,602 400,560 400,800 0,800" fill="#2C241A" opacity={0.95} />
        <Polygon points="0,692 80,642 180,682 280,632 400,682 400,800 0,800" fill="#352B1E" />
      </Svg>
    </View>
  );
}

export function HorizonGlow() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">
        {STARS.slice(0, 6).map((s, i) => <Circle key={i} cx={s.x} cy={s.y * 0.6} r={s.r} fill={colors.cream} opacity={s.o * 0.7} />)}
        <Circle cx={200} cy={860} r={240} fill={colors.copper} opacity={0.10} />
        <Circle cx={200} cy={880} r={160} fill={colors.copperSoft} opacity={0.08} />
      </Svg>
    </View>
  );
}

export function Botanical({ style }: { style?: ViewStyle }) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={190} height={270} viewBox="0 0 190 270" style={{ position: 'absolute', right: -20, bottom: -10 }} opacity={0.45}>
        <Path d="M95 268 C 91 205, 99 120, 95 28" stroke={colors.copper} strokeWidth={1.3} fill="none" />
        <Path d="M95 215 C 66 207, 50 182, 54 155 C 81 165, 93 188, 95 215 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
        <Path d="M95 190 C 124 182, 140 157, 136 130 C 109 140, 97 163, 95 190 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
        <Path d="M95 150 C 68 143, 53 120, 57 95 C 82 104, 93 126, 95 150 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
        <Path d="M95 122 C 121 115, 136 92, 132 68 C 107 77, 97 98, 95 122 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
        <Path d="M95 82 C 74 76, 62 58, 65 38 C 85 46, 93 63, 95 82 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
        <Path d="M95 30 C 100 20, 108 14, 118 12 C 114 24, 106 30, 95 30 Z" stroke={colors.copper} strokeWidth={1} fill="none" />
      </Svg>
    </View>
  );
}
