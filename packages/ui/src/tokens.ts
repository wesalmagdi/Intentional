export const colors = {
  canvas: '#FCFBF8', surface: '#F7F5F0', elevated: '#FFFFFF', sunken: '#F2EEE6',
  ink: '#242321', inkSoft: '#3A3834', grey: '#6F6B63', greyMuted: '#A39E93',
  bronze: '#7A6652', bronzeSoft: '#A08B73', bronzeHairline: '#C9B89E',
  forest: '#1E2A24', forestDeep: '#141E19', ivory: '#F7F5F0',
  border: '#E9E4DB', borderSubtle: '#EFEAD8', hairline: '#E3DCC9',
  danger: '#8A4A3E', success: '#5A7A5A',
  night: '#191510', nightSoft: '#221D16', nightCard: '#2E2820',
  cream: '#F4EEE3', creamCard: '#FBF7EF', creamSunken: '#ECE4D6',
  copper: '#B0793F', copperSoft: '#C89B6A', copperDeep: '#59422C',
  stone: '#8B8377', hairlineDark: 'rgba(244,238,227,0.14)',
} as const;

export const typography = {
  families: {
    display: 'SourceSerif4_600SemiBold', displayItalic: 'SourceSerif4_600SemiBold_Italic',
    body: 'Inter_400Regular', bodyMedium: 'Inter_500Medium', bodySemibold: 'Inter_600SemiBold',
  },
  scale: {
    display:   { size: 34, line: 42, tracking: -0.5 },
    title:     { size: 28, line: 36, tracking: -0.3 },
    heading:   { size: 20, line: 28, tracking: -0.1 },
    body:      { size: 16, line: 26, tracking: 0 },
    bodySmall: { size: 14, line: 22, tracking: 0 },
    caption:   { size: 12, line: 18, tracking: 0.1 },
    eyebrow:   { size: 11, line: 14, tracking: 1.5 },
  },
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 56, 10: 72 } as const;
export const radius = { hair: 2, sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const elevation = {
  none: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  subtle: { shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  card: { shadowColor: colors.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
  floating: { shadowColor: colors.ink, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 28, elevation: 9 },
} as const;

export const theme = {
  colors: { ...colors, background: colors.cream, text: colors.ink, subtle: colors.grey, accent: colors.copper, divider: colors.hairline, highlight: colors.creamCard },
  fonts: typography.families,
  spacing: { xs: space[2], sm: space[3], md: space[4], lg: space[6], xl: space[8] },
  radius: { sm: radius.sm, md: radius.md, lg: radius.lg },
} as const;
