import { Fragment } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { strings } from "../strings";
import { colors, type } from "../theme";
import { Pictogram } from "./Pictogram";

/**
 * «монета» / «деньги» and the coin emoji, as a whole word.
 * Cyrillic is not a JS word character, so the edges are letter lookarounds.
 */
const MONEY_WORD =
  /(?<![A-Za-zА-Яа-яЁё])(?:🪙|монет(?:ами|ах|ам|ой|ою|у|е|ы|а)?|деньг(?:ами|ах|ам|ой|ою|у|е|и)?|денег)(?![A-Za-zА-Яа-яЁё])/gi;

type Part = { kind: "text"; value: string } | { kind: "coin" };

export function splitMoney(text: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const match of text.matchAll(MONEY_WORD)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", value: text.slice(last, index) });
    parts.push({ kind: "coin" });
    last = index + match[0].length;
  }
  if (last < text.length || parts.length === 0) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

function hasCoinWord(parts: readonly Part[]): boolean {
  return parts.some((part) => part.kind === "coin");
}

/**
 * Renders copy with the currency drawn as the coin icon.
 * A bare amount (`coin`) gets the icon beside the words.
 * The spoken label keeps «монеты» / «деньги» for the screen reader.
 */
export function CoinText({
  text,
  style,
  labelled = true,
  coin = false,
  inline = false,
  label,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Expose the original sentence to the screen reader. Off inside a control that already has a name. */
  labelled?: boolean;
  /** This line is an amount even when it never says «монета». */
  coin?: boolean;
  /** Sit in a row (a button label) instead of stretching to the full line. */
  inline?: boolean;
  /** Spoken name when it should differ from the visible sentence. */
  label?: string;
}) {
  const parts = splitMoney(text);
  const words = hasCoinWord(parts);
  if (!words && !coin) return <Text style={style}>{text}</Text>;

  const flat = StyleSheet.flatten(style);
  const color = typeof flat?.color === "string" ? flat.color : colors.text;
  const size = typeof flat?.fontSize === "number" ? flat.fontSize : type.body;
  const spoken = labelled ? { accessible: true as const, accessibilityLabel: label ?? text } : {};

  return (
    <View {...spoken} style={[styles.line, inline ? styles.inline : styles.block]}>
      {words ? (
        parts.map((part, index) =>
          part.kind === "coin" ? (
            <Pictogram key={index} glyph={strings.balanceIcon} size={size} color={color} />
          ) : (
            <Fragment key={index}>{renderWords(part.value, style, index)}</Fragment>
          ),
        )
      ) : (
        <Text style={style}>{text}</Text>
      )}
      {!words && coin ? <Pictogram glyph={strings.balanceIcon} size={size} color={color} /> : null}
    </View>
  );
}

/** One text node per word so the row can wrap mid-sentence. */
function renderWords(value: string, style: StyleProp<TextStyle> | undefined, key: number) {
  return value.split(/(\s+)/).map((bit, index) =>
    bit.length === 0 ? null : (
      <Text key={`${key}-${index}`} style={style}>
        {bit}
      </Text>
    ),
  );
}

const styles = StyleSheet.create({
  line: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  block: {
    alignSelf: "stretch",
  },
  inline: {
    flexGrow: 1,
    flexShrink: 1,
  },
});
