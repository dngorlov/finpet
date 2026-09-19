import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import { tourScrollsToEnd } from "../howToPlay/beats";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  footer,
  keyboardShouldPersistTaps,
}: {
  children: ReactNode;
  footer?: ReactNode;
  keyboardShouldPersistTaps?: "always" | "handled" | "never";
}) {
  const tour = useHowToPlayTour();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!tour.active || !tour.beatId) return;
    const id = tour.beatId;
    if (tourScrollsToEnd(id)) {
      scrollRef.current?.scrollToEnd({ animated: false });
      return;
    }
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tour.active, tour.beatId]);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        scrollEnabled={!tour.active}
        style={styles.scroll}
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.m,
    padding: spacing.l,
  },
  footer: {
    backgroundColor: colors.background,
    gap: spacing.s,
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
  },
});
