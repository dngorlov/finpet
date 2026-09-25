import type { StyleProp, TextStyle } from "react-native";
import { screenTitleStyle } from "../theme";
import { CoinText } from "./CoinText";

/** Screen heading. Most titles use the pixel face; a few long lines stay the phone font. */
export function ScreenTitle({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  return <CoinText text={children} style={[style, screenTitleStyle(children)]} />;
}
