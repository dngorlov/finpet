import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { strings } from "../strings";

export function TapCursor() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessible
      aria-label={strings.howToPlayTap}
      pointerEvents="none"
      style={[styles.wrap, { transform: [{ scale: pulse }] }]}
    >
      <Text aria-hidden style={styles.cursor}>
        {strings.howToPlayTapCursor}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    bottom: 4,
    position: "absolute",
    right: 4,
    zIndex: 2,
  },
  cursor: {
    fontSize: 32,
  },
});
