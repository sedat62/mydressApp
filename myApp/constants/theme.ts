import { Platform } from 'react-native';

export const Colors = {
  primary: '#6C63FF',
  primaryLight: '#E8E5FF',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  icon: '#6B7280',
  white: '#FFFFFF',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000000',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
