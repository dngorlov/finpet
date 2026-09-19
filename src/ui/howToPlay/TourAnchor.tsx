import { useEffect, useRef, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useHowToPlayTour } from "./HowToPlayTourProvider";
import type { TourBeatId } from "./beats";

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
  const ref = useRef<View>(null);
  const { active, beatId, setAnchor } = tour;

  const measure = () => {
    if (!active || beatId !== id) return;
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) setAnchor(id, { x, y, width, height });
    });
  };

  useEffect(() => {
    if (!active || beatId !== id) return;
    const timer = setTimeout(measure, 50);
    return () => clearTimeout(timer);
  }, [active, beatId, id, setAnchor]);

  return (
    <View ref={ref} collapsable={false} style={style} onLayout={measure}>
      {children}
    </View>
  );
}
