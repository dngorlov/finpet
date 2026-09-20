import { Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { STAGE_CODES, STAGE_NAMES, type Stage } from "../../core/stages";
import { META_KEYS } from "../../data/metaKeys";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import { MeterBar } from "./MeterBar";

const STAGE_ORDER: Stage[] = ["novice", "friend", "master"];

export function StatusStrip() {
  const focused = useIsFocused();
  const tour = useHowToPlayTour();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { game, meta } = useSession();
  const profileId = meta.get(META_KEYS.activeProfileId);
  const profile = profileId ? game.getProfile(profileId) : null;

  if (!focused || tour.active || !profile) return null;

  const stageName = STAGE_NAMES[profile.stage];
  const reached = STAGE_CODES[profile.stage];

  return (
    <View style={styles.row}>
      <MeterBar compact icon={strings.careIcon} label={strings.care} value={profile.care} />
      <MeterBar compact icon={strings.moodIcon} label={strings.mood} value={profile.mood} />
      <View accessible aria-label={strings.balanceBadge(profile.balance)} style={styles.balance}>
        <Text aria-hidden style={styles.icon}>
          {strings.balanceIcon}
        </Text>
        <Text aria-hidden style={styles.balanceValue}>
          {profile.balance}
        </Text>
      </View>
      <View accessible aria-label={strings.stageA11y(stageName)} style={styles.stage}>
        {STAGE_ORDER.map((stage) => (
          <View
            key={stage}
            aria-hidden
            style={[styles.dot, STAGE_CODES[stage] <= reached ? styles.dotReached : styles.dotAhead]}
          />
        ))}
        <Text style={styles.stageName}>{stageName}</Text>
      </View>
      <Pressable
        role="button"
        aria-label={strings.settings}
        onPress={() => navigation.navigate("Settings")}
        style={styles.settings}
      >
        <Text aria-hidden style={styles.settingsIcon}>
          {strings.settingsIcon}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.background,
    flexDirection: "row",
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  balance: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  icon: {
    fontSize: type.body,
  },
  balanceValue: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  stage: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    gap: 4,
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  dotReached: {
    backgroundColor: colors.fill,
  },
  dotAhead: {
    backgroundColor: colors.disabledFace,
  },
  stageName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  settings: {
    alignItems: "center",
    height: minTarget,
    justifyContent: "center",
    width: minTarget,
  },
  settingsIcon: {
    fontSize: type.section,
  },
});
