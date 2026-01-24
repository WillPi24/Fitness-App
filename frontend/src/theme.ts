// Centralized color palette for consistent theming.
export const colors = {
  background: '#F7F3EE',
  surface: '#FFFFFF',
  text: '#1B1F24',
  muted: '#5C6670',
  border: '#E4DDD5',
  accent: '#E4572E',
  accentSoft: '#FDE8DA',
  success: '#2A9D8F',
  danger: '#D64545',
};

// Shared spacing scale for layout rhythm.
export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

// Typography tokens aligned with loaded fonts.
export const typography = {
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
};
