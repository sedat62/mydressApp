import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  disabled = false,
}: ActionButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Bg` as keyof typeof styles] as ViewStyle,
    styles[`${size}Size` as keyof typeof styles] as ViewStyle,
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [...buttonStyles, pressed && styles.pressed]}>
      {icon}
      <Text style={textStyles}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
  },
  primaryBg: {
    backgroundColor: Colors.primary,
  },
  secondaryBg: {
    backgroundColor: Colors.primaryLight,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  smallSize: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mediumSize: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  largeSize: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.primary,
  },
  outlineText: {
    color: Colors.text,
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
