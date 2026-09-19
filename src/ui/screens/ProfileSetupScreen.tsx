import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type Role } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { AppButton } from "../components/AppButton";
import { ACCESSORY_KEYS, COLOR_KEYS, SPECIES_KEYS } from "../pet/keys";
import { PetView } from "../pet/PetView";
import { META_KEYS } from "../session/metaKeys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileSetup">;

/** RN's Role union omits ARIA `textbox`; RNTL queries fields by that role. */
const TEXTBOX_ROLE = "textbox" as Role;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [species, setSpecies] = useState<(typeof SPECIES_KEYS)[number]>("sp1");
  const [color, setColor] = useState<(typeof COLOR_KEYS)[number]>("c1");
  const [accessory, setAccessory] = useState<(typeof ACCESSORY_KEYS)[number]>("a1");
  const [playerName, setPlayerName] = useState("");
  const [petName, setPetName] = useState("");
  const canPlay = playerName.trim().length > 0 && petName.trim().length > 0;
  const firstGoal = content.goals[0];

  const play = () => {
    if (!canPlay || !firstGoal) return;
    const id = game.createProfile({
      name: playerName.trim(),
      petName: petName.trim(),
      species,
      color,
      accessory,
      contentVersion: content.contentVersion,
      goals: content.goals.map((g) => ({ key: g.id, cost: g.cost })),
      activeGoalKey: firstGoal.id,
    });
    meta.set(META_KEYS.activeProfileId, id);
    meta.set(META_KEYS.onboardingDone, "1");
    navigation.reset({ index: 0, routes: [{ name: "StartingBudget" }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <PetView species={species} color={color} accessory={accessory} pose="idle" />
      <ChipRow
        legend={strings.speciesLegend}
        keys={SPECIES_KEYS}
        labelOf={strings.speciesName}
        value={species}
        onChange={setSpecies}
      />
      <ChipRow
        legend={strings.colorLegend}
        keys={COLOR_KEYS}
        labelOf={strings.colorName}
        value={color}
        onChange={setColor}
      />
      <ChipRow
        legend={strings.accessoryLegend}
        keys={ACCESSORY_KEYS}
        labelOf={strings.accessoryName}
        value={accessory}
        onChange={setAccessory}
      />
      <Text style={styles.legend}>{strings.playerNameLabel}</Text>
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.playerNameLabel}
        value={playerName}
        onChangeText={setPlayerName}
        style={styles.input}
      />
      <Text style={styles.legend}>{strings.petNameLabel}</Text>
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.petNameLabel}
        value={petName}
        onChangeText={setPetName}
        style={styles.input}
      />
      <AppButton label={strings.play} disabled={!canPlay} onPress={play} />
    </ScrollView>
  );
}

function ChipRow<K extends string>({
  legend,
  keys,
  labelOf,
  value,
  onChange,
}: {
  legend: string;
  keys: readonly K[];
  labelOf: (key: string) => string;
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <View style={styles.chipBlock}>
      <Text style={styles.legend}>{legend}</Text>
      <View style={styles.chipRow}>
        {keys.map((key) => (
          <Pressable
            key={key}
            role="button"
            aria-label={labelOf(key)}
            aria-selected={value === key}
            onPress={() => onChange(key)}
            style={[styles.chip, value === key ? styles.chipOn : null]}
          >
            <Text style={styles.chipLabel}>{labelOf(key)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    gap: spacing.m,
    padding: spacing.l,
  },
  legend: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: type.body,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  chipBlock: {
    gap: spacing.s,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  chipOn: {
    backgroundColor: colors.highlight,
    borderColor: colors.accent,
  },
  chipLabel: {
    color: colors.text,
    fontSize: type.body,
  },
});
