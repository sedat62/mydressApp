import { StyleSheet, Text, View } from 'react-native';

interface WatermarkOverlayProps {
  visible: boolean;
}

const ROWS = 5;
const COLS = 3;

export function WatermarkOverlay({ visible }: WatermarkOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: ROWS }).map((_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: COLS }).map((_, col) => (
            <View key={col} style={styles.cell}>
              <Text style={styles.text}>TryOn AI</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    overflow: 'hidden',
    transform: [{ rotate: '-25deg' }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '140%',
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
