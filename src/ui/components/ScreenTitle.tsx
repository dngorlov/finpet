import { Text, type StyleProp, type TextStyle } from "react-native";
import { screenTitleStyle } from "../theme";

/** Screen heading. Short one-line titles use the pixel face; the rest stay the phone font. */
export function ScreenTitle({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[style, screenTitleStyle(children)]}>{children}</Text>;
}
