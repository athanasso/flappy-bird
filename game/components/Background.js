import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS, FLOOR_HEIGHT, WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';

/**
 * Parallax Background – two-layer scrolling background.
 * Layer 1 (far): Slow-moving mountains/hills
 * Layer 2 (near): Faster-moving bushes/ground detail
 * Plus clouds that drift across the sky.
 */

const CLOUD_DATA = [
  { top: 60, size: 50, delay: 0 },
  { top: 140, size: 40, delay: 3000 },
  { top: 90, size: 60, delay: 7000 },
  { top: 200, size: 35, delay: 5000 },
  { top: 50, size: 45, delay: 10000 },
];

const Cloud = ({ top, size, delay }) => {
  const translateX = useRef(new Animated.Value(WINDOW_WIDTH + size)).current;

  useEffect(() => {
    const duration = 18000 + size * 100;

    const animate = () => {
      translateX.setValue(WINDOW_WIDTH + size);
      Animated.timing(translateX, {
        toValue: -size * 3,
        duration,
        useNativeDriver: true,
      }).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top,
          width: size * 2,
          height: size * 0.6,
          borderRadius: size * 0.3,
          transform: [{ translateX }],
        },
      ]}
    >
      <View
        style={[
          styles.cloudPuff,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            bottom: size * 0.1,
            left: size * 0.2,
          },
        ]}
      />
      <View
        style={[
          styles.cloudPuff,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            bottom: size * 0.05,
            left: size * 0.7,
          },
        ]}
      />
    </Animated.View>
  );
};

// Mountain shape using triangles approximated by rotated squares
const Mountain = ({ left, width, height, color }) => (
  <View
    style={[
      styles.mountain,
      {
        left,
        width,
        height,
        borderBottomLeftRadius: width * 0.1,
        borderBottomRightRadius: width * 0.1,
        backgroundColor: color,
      },
    ]}
  />
);

const Background = () => {
  const skyHeight = WINDOW_HEIGHT - FLOOR_HEIGHT;

  // Far layer animation
  const farScrollX = useRef(new Animated.Value(0)).current;
  // Near layer animation
  const nearScrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Far mountains scroll slowly
    const farAnim = Animated.loop(
      Animated.timing(farScrollX, {
        toValue: -WINDOW_WIDTH,
        duration: 30000,
        useNativeDriver: true,
      })
    );
    farAnim.start();

    // Near bushes scroll faster
    const nearAnim = Animated.loop(
      Animated.timing(nearScrollX, {
        toValue: -WINDOW_WIDTH,
        duration: 15000,
        useNativeDriver: true,
      })
    );
    nearAnim.start();

    return () => {
      farAnim.stop();
      nearAnim.stop();
    };
  }, []);

  const farMountains = [];
  const nearBushes = [];

  // Generate far mountains (two sets for seamless loop)
  for (let i = 0; i < 2; i++) {
    const offset = i * WINDOW_WIDTH;
    farMountains.push(
      <Mountain key={`fm1-${i}`} left={offset + 20} width={140} height={120} color={COLORS.bgMountainFar} />,
      <Mountain key={`fm2-${i}`} left={offset + 120} width={100} height={90} color={COLORS.bgMountainFar} />,
      <Mountain key={`fm3-${i}`} left={offset + 250} width={160} height={130} color={COLORS.bgMountainFar} />,
      <Mountain key={`fm4-${i}`} left={offset + 380} width={90} height={80} color={COLORS.bgMountainFar} />,
    );
  }

  // Generate near bushes (two sets for seamless loop)
  for (let i = 0; i < 2; i++) {
    const offset = i * WINDOW_WIDTH;
    nearBushes.push(
      <Mountain key={`nb1-${i}`} left={offset + 0} width={80} height={45} color={COLORS.bgBush} />,
      <Mountain key={`nb2-${i}`} left={offset + 90} width={60} height={35} color={COLORS.bgBush} />,
      <Mountain key={`nb3-${i}`} left={offset + 180} width={100} height={50} color={COLORS.bgBush} />,
      <Mountain key={`nb4-${i}`} left={offset + 300} width={70} height={40} color={COLORS.bgBush} />,
      <Mountain key={`nb5-${i}`} left={offset + 400} width={90} height={48} color={COLORS.bgBush} />,
    );
  }

  return (
    <View style={[styles.container, { height: skyHeight }]}>
      {/* Sky gradient approximation */}
      <View style={styles.skyTop} />
      <View style={styles.skyBottom} />

      {/* Clouds */}
      {CLOUD_DATA.map((c, i) => (
        <Cloud key={i} top={c.top} size={c.size} delay={c.delay} />
      ))}

      {/* Far layer – mountains */}
      <Animated.View
        style={[
          styles.farLayer,
          { transform: [{ translateX: farScrollX }] },
        ]}
      >
        {farMountains}
      </Animated.View>

      {/* Near layer – bushes */}
      <Animated.View
        style={[
          styles.nearLayer,
          { transform: [{ translateX: nearScrollX }] },
        ]}
      >
        {nearBushes}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  skyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: COLORS.skyGradientTop,
  },
  skyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: COLORS.sky,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: COLORS.bgCloud,
    overflow: 'visible',
  },
  cloudPuff: {
    position: 'absolute',
    backgroundColor: COLORS.bgCloud,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
  },
  farLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: WINDOW_WIDTH * 2,
    height: 140,
  },
  nearLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: WINDOW_WIDTH * 2,
    height: 55,
  },
});

export default Background;
