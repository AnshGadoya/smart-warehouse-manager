// styles/theme.js
export const Colors = {
  primary: '#1A237E',
  primaryLight: '#3949AB',
  primaryDark: '#0D1642',
  accent: '#00BCD4',
  accentLight: '#4DD0E1',

  success: '#43A047',
  successLight: '#E8F5E9',
  warning: '#FB8C00',
  warningLight: '#FFF3E0',
  danger: '#E53935',
  dangerLight: '#FFEBEE',
  info: '#1E88E5',
  infoLight: '#E3F2FD',

  // Rack colours
  rackEmpty: '#43A047',
  rackPartial: '#FB8C00',
  rackFull: '#E53935',
  rackSelected: '#1E88E5',

  white: '#FFFFFF',
  black: '#000000',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  textPrimary: '#1A1A2E',
  textSecondary: '#5C5C7A',
  textMuted: '#9E9E9E',
  textWhite: '#FFFFFF',

  background: '#F0F2F8',
  cardBackground: '#FFFFFF',

  // Dark mode
  darkBackground: '#0F0F1A',
  darkCard: '#1C1C2E',
  darkSurface: '#252540',
  darkText: '#E0E0E0',
  darkTextSecondary: '#9E9EA8',
  darkBorder: '#2E2E48',
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const BorderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const FontSize = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
};
