import { StyleSheet, View } from 'react-native';
import { BIRD_SIZE, COLORS } from '../constants';

/**
 * Bird component – renders the "Derpy Disk" character.
 * Structured so you can easily swap in <Image /> later.
 *
 * The entity prop comes from react-native-game-engine:
 * { body: { position: {x, y} }, size: [w, h], rotation, ... }
 */
const Bird = (props) => {
  const { body, size } = props;
  const [width, height] = size;
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  // Derive rotation from velocity for a nice tilt effect
  const velocity = body.velocity?.y || 0;
  const rotation = Math.min(Math.max(velocity * 3, -30), 90);

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          width: width,
          height: height,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      {/* Main body – swap this View with <Image source={...} /> to use a sprite */}
      <View style={[styles.body, { width, height, borderRadius: width / 2 }]}>
        {/* Body highlight / shine */}
        <View style={styles.bodyHighlight} />

        {/* Eye */}
        <View style={styles.eye}>
          <View style={styles.pupil} />
        </View>

        {/* Beak */}
        <View style={styles.beak} />

        {/* Wing */}
        <View style={[styles.wing, { top: height * 0.45 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  body: {
    backgroundColor: COLORS.bird,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    borderWidth: 2,
    borderColor: COLORS.birdInner,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  bodyHighlight: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: BIRD_SIZE * 0.4,
    height: BIRD_SIZE * 0.25,
    borderRadius: BIRD_SIZE * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  eye: {
    position: 'absolute',
    top: BIRD_SIZE * 0.15,
    right: BIRD_SIZE * 0.18,
    width: BIRD_SIZE * 0.3,
    height: BIRD_SIZE * 0.3,
    borderRadius: BIRD_SIZE * 0.15,
    backgroundColor: COLORS.birdEye,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  pupil: {
    width: BIRD_SIZE * 0.15,
    height: BIRD_SIZE * 0.15,
    borderRadius: BIRD_SIZE * 0.1,
    backgroundColor: COLORS.birdPupil,
    marginLeft: 2,
    marginTop: 1,
  },
  beak: {
    position: 'absolute',
    right: -BIRD_SIZE * 0.18,
    top: BIRD_SIZE * 0.38,
    width: 0,
    height: 0,
    borderLeftWidth: BIRD_SIZE * 0.22,
    borderTopWidth: BIRD_SIZE * 0.1,
    borderBottomWidth: BIRD_SIZE * 0.1,
    borderLeftColor: COLORS.birdBeak,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  wing: {
    position: 'absolute',
    left: -4,
    width: BIRD_SIZE * 0.35,
    height: BIRD_SIZE * 0.2,
    borderRadius: BIRD_SIZE * 0.1,
    backgroundColor: COLORS.birdInner,
    borderWidth: 1,
    borderColor: '#C68A12',
  },
});

export default Bird;
