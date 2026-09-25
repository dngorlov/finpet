import { Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { STAGE_CODES, STAGE_NAMES, type Stage } from "../../core/stages";
import { META_KEYS } from "../../data/metaKeys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { MeterBar } from "./MeterBar";
import { Pictogram } from "./Pictogram";

const STAGE_ORDER: Stage[] = ["novice", "friend", "master"];
const EDGE = 4;

export function StatusStrip() {
  const focused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { revision } = usePlayChrome();
  const { game, meta } = useSession();
  const profileId = meta.get(META_KEYS.activeProfileId);
  void revision;
  const profile = profileId ? game.getProfile(profileId) : null;

  if (!focused || !profile) return null;

  const stageName = STAGE_NAMES[profile.stage];
  const reached = STAGE_CODES[profile.stage];

  return (
    <View style={styles.wrap}>
      <View style={styles.status}>
        <View accessible aria-label={strings.balanceBadge(profile.balance)} style={styles.balance}>
          <Pictogram glyph={strings.balanceIcon} />
          <Text aria-hidden style={styles.balanceValue}>
            {profile.balance}
          </Text>
        </View>
        <View accessible aria-label={strings.stageA11y(stageName)} style={styles.stage}>
          <View aria-hidden style={styles.beads}>
            <View style={styles.beadLine} />
            {STAGE_ORDER.map((stage) => (
              <View
                key={stage}
                style={[styles.disc, STAGE_CODES[stage] <= reached ? styles.discReached : styles.discAhead]}
              >
                <View style={styles.spindle} />
              </View>
            ))}
          </View>
          <Text style={styles.stageName}>{stageName}</Text>
        </View>
        <Pressable
          role="button"
          aria-label={strings.settings}
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [styles.settingsShell, pressed ? styles.settingsPressed : null]}
        >
          <View style={styles.settingsFace}>
            <Pictogram glyph={strings.settingsIcon} />
          </View>
        </Pressable>
      </View>
      <View style={styles.meters}>
        <MeterBar compact icon={strings.careIcon} label={strings.care} value={profile.care} />
        <MeterBar compact icon={strings.moodIcon} label={strings.mood} value={profile.mood} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  status: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  meters: {
    flexDirection: "row",
    gap: spacing.m,
  },
  balance: {
    alignItems: "center",
    backgroundColor: colors.badgeFill,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.s,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  balanceValue: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  stage: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    gap: spacing.s,
  },
  beads: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
  },
  beadLine: {
    backgroundColor: colors.track,
    height: 4,
    left: 10,
    position: "absolute",
    right: 10,
  },
  disc: {
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 3,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  discReached: {
    backgroundColor: colors.fill,
    borderColor: colors.fill,
  },
  discAhead: {
    backgroundColor: colors.card,
    borderColor: colors.disabledFace,
  },
  spindle: {
    backgroundColor: colors.card,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  stageName: {
    color: colors.text,
    fontSize: type.body,
  },
  settingsShell: {
    backgroundColor: colors.raisedEdge,
    borderRadius: minTarget / 2,
    paddingBottom: EDGE,
  },
  settingsPressed: {
    paddingBottom: 0,
    paddingTop: EDGE,
  },
  settingsFace: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: minTarget / 2,
    height: minTarget - EDGE,
    justifyContent: "center",
    width: minTarget,
  },
});
