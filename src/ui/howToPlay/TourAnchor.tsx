import { useEffect, useRef, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useHowToPlayTour } from "./HowToPlayTourProvider";
import { TapCursor } from "./TapCursor";
import { beatById, type TourBeatId } from "./beats";

export function TourAnchor({
  id,
  children,
  style,
}: {
  id: TourBeatId;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const tour = useHowToPlayTour();
  const focused = useIsFocused();
  const ref = useRef<View>(null);
  const placed = useRef(false);
  const inflight = useRef(false);
  const { active, beatId, setAnchor, scrollChildToCenter } = tour;
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const beatRef = useRef(beatId);
  beatRef.current = beatId;
  const showTap = Boolean(active && beatId === id && focused && beatById(id)?.advance === "tap");

  const reportHole = () => {
    if (!focusedRef.current || beatRef.current !== id) return;
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0 && focusedRef.current && beatRef.current === id) {
        setAnchor(id, { x, y, width, height });
      }
    });
  };

  const place = () => {
    if (!active || beatId !== id || !focused || !ref.current) return;
    if (inflight.current) return;
    inflight.current = true;
    scrollChildToCenter(ref.current, (ok) => {
      inflight.current = false;
      placed.current = ok;
      if (ok) reportHole();
    });
  };

  useEffect(() => {
    if (!active || beatId !== id || !focused) {
      placed.current = false;
      inflight.current = false;
      return;
    }
    const start = setTimeout(place, 50);
    const retry = setTimeout(() => {
      placed.current = false;
      place();
    }, 450);
    return () => {
      clearTimeout(start);
      clearTimeout(retry);
    };
  }, [active, beatId, focused, id]);

  return (
    <View ref={ref} collapsable={false} style={style} onLayout={place}>
      {children}
      {showTap ? <TapCursor /> : null}
    </View>
  );
}
