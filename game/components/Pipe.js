import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

/**
 * Pipe component – renders a single pipe (top or bottom).
 * Swap the inner View with <Image /> for custom sprites.
 *
 * Props from entity: { body, size: [w, h], isTop }
 */
const Pipe = (props) => {
  const { body, size, isTop } = props;
  const [width, height] = size;
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  const CAP_HEIGHT = 26;
  const CAP_OVERHANG = 6;

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
      {/* Pipe body */}
      <View style={[styles.pipeBody, { width, height }]}>
        {/* Highlight stripe */}
        <View style={styles.highlight} />
        {/* Shadow stripe */}
        <View style={styles.shadow} />
      </View>

      {/* Pipe cap (lip) – at the opening end */}
      <View
        style={[
          styles.cap,
          {
            width: width + CAP_OVERHANG * 2,
            height: CAP_HEIGHT,
            left: -CAP_OVERHANG,
            ...(isTop
              ? { bottom: 0 }
              : { top: 0 }),
          },
        ]}
      >
        <View style={styles.capHighlight} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  pipeBody: {
    backgroundColor: COLORS.pipeBody,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.pipeBorder,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: COLORS.pipeHighlight,
    opacity: 0.5,
    borderRadius: 4,
  },
  shadow: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: COLORS.pipeBorder,
    opacity: 0.3,
    borderRadius: 3,
  },
  cap: {
    position: 'absolute',
    backgroundColor: COLORS.pipeCap,
    borderWidth: 2,
    borderColor: COLORS.pipeCapBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  capHighlight: {
    position: 'absolute',
    left: 4,
    top: 3,
    bottom: 3,
    width: 6,
    backgroundColor: COLORS.pipeHighlight,
    opacity: 0.4,
    borderRadius: 3,
  },
});

export default Pipe;
