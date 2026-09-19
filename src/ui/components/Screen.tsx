import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
