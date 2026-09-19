import { useCallback, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import type { RootStackParamList } from "../navigation/types";
import { demoExists, enterDemo, exitDemo, resetDemo } from "../session/demoMode";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Demo">;

export default function DemoScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [demoOn, setDemoOn] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [askingConfirm, setAskingConfirm] = useState(false);
  const [askingResetConfirm, setAskingResetConfirm] = useState(false);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    const active = profileId ? game.getProfile(profileId) : null;
    setDemoOn(Boolean(active?.isDemo));
    setCanReset(demoExists(game, meta));
    setAskingConfirm(false);
    setAskingResetConfirm(false);
  }, [game, meta]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const goMain = () => navigation.reset({ index: 0, routes: [{ name: "Main" }] });

  const turnOn = () => {
    enterDemo(game, meta, content);
    goMain();
  };

  const turnOff = () => {
    exitDemo(meta);
    goMain();
  };

  const reset = () => {
    resetDemo(game, meta, content);
    goMain();
  };

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>{strings.navAdult}</Text>
      <Card>
        <Chip label={strings.demoMode} selected={demoOn} onPress={() => (demoOn ? turnOff() : setAskingConfirm(true))} />
        {canReset ? <TextButton label={strings.demoReset} onPress={() => setAskingResetConfirm(true)} /> : null}
      </Card>
      {askingConfirm ? (
        <Modal animationType="slide" transparent visible onRequestClose={() => setAskingConfirm(false)}>
          <View style={styles.backdrop} pointerEvents="box-none">
            <View style={styles.sheet}>
              <Text style={styles.section}>{strings.demoMode}</Text>
              <Text style={styles.body}>{strings.demoConfirmBody}</Text>
              <TextButton label={strings.close} onPress={() => setAskingConfirm(false)} />
              <PrimaryButton label={strings.done} onPress={turnOn} />
            </View>
          </View>
        </Modal>
      ) : null}
      {askingResetConfirm ? (
        <Modal animationType="slide" transparent visible onRequestClose={() => setAskingResetConfirm(false)}>
          <View style={styles.backdrop} pointerEvents="box-none">
            <View style={styles.sheet}>
              <Text style={styles.section}>{strings.demoReset}</Text>
              <Text style={styles.body}>{strings.demoResetConfirmBody}</Text>
              <TextButton label={strings.close} onPress={() => setAskingResetConfirm(false)} />
              <PrimaryButton label={strings.done} onPress={reset} />
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    gap: spacing.s,
    padding: spacing.l,
  },
});
