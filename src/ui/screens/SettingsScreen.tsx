import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import { APP_BUILD, APP_VERSION } from "../appInfo";
import { BackButton } from "../components/BackButton";
import { DevSettings } from "../components/DevSettings";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const { game, meta } = useSession();

  const deleteActiveProfile = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (profileId) {
      game.deleteProfile(profileId);
      meta.remove(META_KEYS.activeProfileId);
      meta.remove(META_KEYS.onboardingDone);
    }
    navigation.reset({ index: 0, routes: [{ name: "FirstRun" }] });
  };

  return (
    <View style={styles.screen}>
      <BackButton />
      <Text style={styles.title}>{strings.appName}</Text>
      <Text style={styles.body}>{strings.versionLine(APP_VERSION, APP_BUILD)}</Text>
      <DevSettings onDeleteProfile={deleteActiveProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.m,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.subtle,
    fontSize: type.body,
  },
});
