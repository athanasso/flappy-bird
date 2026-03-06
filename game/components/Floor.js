import { StyleSheet, View } from 'react-native';
import { COLORS, WINDOW_WIDTH } from '../constants';

/**
 * Floor component – rendered at the bottom of the screen.
 * Has a scrolling pattern effect.
 *
 * Props: { body, size: [w, h] }
 */
const Floor = (props) => {
  const { body, size } = props;
  const [width, height] = size;
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  // Create dashes for the floor pattern
  const dashes = [];
  const dashWidth = 30;
  const dashCount = Math.ceil(WINDOW_WIDTH / dashWidth) + 2;
  for (let i = 0; i < dashCount; i++) {
    dashes.push(
      <View
        key={i}
        style={[
          styles.dash,
          {
            left: i * dashWidth,
            backgroundColor: i % 2 === 0 ? COLORS.floor : COLORS.floorDark,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width: width,
          height: height,
        },
      ]}
    >
      {/* Top edge line */}
      <View style={styles.topEdge} />
      {/* Pattern */}
      <View style={styles.patternRow}>{dashes}</View>
      {/* Fill below */}
      <View style={styles.fill} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
  },
  topEdge: {
    height: 4,
    backgroundColor: COLORS.floorLine,
    width: '100%',
  },
  patternRow: {
    flexDirection: 'row',
    height: 20,
  },
  dash: {
    width: 30,
    height: 20,
  },
  fill: {
    flex: 1,
    backgroundColor: COLORS.floorDark,
  },
});

export default Floor;
