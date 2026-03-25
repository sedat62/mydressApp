import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'sparkles': 'auto-awesome',
  'person.2.fill': 'people',
  'person.circle.fill': 'account-circle',
  'gear': 'settings',
  'magnifyingglass': 'search',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'square.and.arrow.up': 'share',
  'bubble.right': 'chat-bubble-outline',
  'photo.on.rectangle': 'photo-library',
  'camera.fill': 'camera-alt',
  'arrow.down.circle.fill': 'file-download',
  'bell.fill': 'notifications',
  'lock.fill': 'lock',
  'questionmark.circle': 'help-outline',
  'info.circle': 'info-outline',
  'arrow.right.square': 'logout',
  'xmark': 'close',
  'checkmark': 'check',
  'plus': 'add',
  'arrow.left': 'arrow-back',
  'bag.fill': 'shopping-bag',
  'shoe.fill': 'directions-walk',
  'eyeglasses': 'visibility',
  'clock.fill': 'watch-later',
  'star.fill': 'star',
} as IconMapping;

export type { IconSymbolName };

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
