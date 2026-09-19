import { useRef, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useHowToPlayTour } from "./HowToPlayTourProvider";

export function TourAnchor({
  id,
  children,
  style,
}: {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const tour = useHowToPlayTour();
  const ref = useRef<View>(null);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={style}
      onLayout={() => {
        if (!tour.active) return;
        ref.current?.measureInWindow((x, y, width, height) => {
          if (width > 0 && height > 0) tour.setAnchor(id, { x, y, width, height });
        });
      }}
    >
      {children}
    </View>
  );
}
