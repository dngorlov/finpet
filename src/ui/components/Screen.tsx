import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { TOUR_CHROME_OVERLAP, tourCenterScrollY } from "../howToPlay/beats";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import { colors, spacing } from "../theme";

export function Screen({
  children,
  footer,
  header,
  keyboardShouldPersistTaps,
}: {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  keyboardShouldPersistTaps?: "always" | "handled" | "never";
}) {
  const tour = useHowToPlayTour();
  const focused = useIsFocused();
  const frameRef = useRef<View>(null);
  const contentRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const activeRef = useRef(tour.active);
  activeRef.current = tour.active;
  const pending = useRef<{ child: View; onDone: (ok: boolean) => void } | null>(null);
  const processedGen = useRef(0);
  const [allowScroll, setAllowScroll] = useState(true);
  const [scrollGen, setScrollGen] = useState(0);
  const { registerScroll, active } = tour;

  useLayoutEffect(() => {
    if (!active) setAllowScroll(true);
  }, [active]);

  useLayoutEffect(() => {
    if (!focused) return;
    return registerScroll({
      scrollChildToCenter: (child, onDone) => {
        pending.current = { child, onDone };
        setAllowScroll(true);
        setScrollGen((n) => n + 1);
      },
    });
  }, [focused, registerScroll]);

  useEffect(() => {
    if (!allowScroll || scrollGen === 0 || processedGen.current === scrollGen) return;
    const job = pending.current;
    if (!job) return;
    processedGen.current = scrollGen;
    pending.current = null;
    const { child, onDone } = job;
    const scroll = scrollRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    let finished = false;
    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      if (activeRef.current) setAllowScroll(false);
      onDone(ok);
    };
    const watchdog = setTimeout(() => finish(false), 400);
    if (!scroll || !frame || !content) {
      clearTimeout(watchdog);
      finish(false);
      return;
    }
    frame.measureInWindow((_fx, _fy, _fw, fh) => {
      content.measureInWindow((_cox, contentY, _cow, _coh) => {
        child.measureInWindow((_cx, cy, cw, ch) => {
          if (cw <= 0 || ch <= 0 || fh <= 0) {
            clearTimeout(watchdog);
            finish(false);
            return;
          }
          const nextY = tourCenterScrollY(cy - contentY, ch, fh, TOUR_CHROME_OVERLAP);
          scroll.setNativeProps({ scrollEnabled: true });
          scroll.scrollTo({ x: 0, y: nextY, animated: false });
          setTimeout(() => {
            clearTimeout(watchdog);
            finish(true);
          }, 80);
        });
      });
    });
  }, [allowScroll, scrollGen]);

  return (
    <View style={styles.root}>
      {header}
      <View ref={frameRef} collapsable={false} style={styles.scroll}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.grow}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          scrollEnabled={allowScroll}
          style={styles.scroll}
        >
          <View ref={contentRef} collapsable={false} style={styles.content}>
            {children}
          </View>
        </ScrollView>
      </View>
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
  grow: {
    flexGrow: 1,
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
