import { useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type Role,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createLocalId } from "../../data/localId";
import { PrimaryButton } from "../components/PrimaryButton";
import { HowToPlay } from "../components/HowToPlay";
import type { RootStackParamList } from "../navigation/types";
import {
  ACCESSORY_KEYS,
  COLOR_KEYS,
  SPECIES_KEYS,
  type AccessoryKey,
  type ColorKey,
  type SpeciesKey,
} from "../pet/keys";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "FirstRun">;
type Phase = "pet" | "names" | "rules";
type FirstRunDraft = {
  profileId: string;
  species: SpeciesKey;
  color: ColorKey;
  accessory: AccessoryKey;
  playerName: string;
  petName: string;
};

const TEXTBOX_ROLE = "textbox" as Role;
const GRAPHEME_SEGMENTER = new Intl.Segmenter("ru", { granularity: "grapheme" });

export default function FirstRunScreen({ navigation }: Props) {
  const { content, firstRun } = useSession();
  const [phase, setPhase] = useState<Phase>("pet");
  const [draft, setDraft] = useState<FirstRunDraft>(() => ({
    profileId: createLocalId("profile"),
    species: "sp1",
    color: "c1",
    accessory: "a1",
    playerName: "",
    petName: "",
  }));
  const [playerNameTouched, setPlayerNameTouched] = useState(false);
  const [petNameTouched, setPetNameTouched] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (phase === "rules") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (phase === "pet") return false;
      setPhase("pet");
      return true;
    });
    return () => subscription.remove();
  }, [phase]);

  if (phase === "rules") {
    const finish = () => {
      if (saving) return;
      const firstGoal = content.goals[0];
      if (!firstGoal) {
        setSaveError(strings.firstRunSaveFailed);
        return;
      }
      setSaving(true);
      setSaveError(null);
      try {
        firstRun.complete({
          id: draft.profileId,
          name: draft.playerName.trim(),
          petName: draft.petName.trim(),
          species: draft.species,
          color: draft.color,
          accessory: draft.accessory,
          contentVersion: content.contentVersion,
          goals: content.goals.map((goal) => ({ key: goal.id, cost: goal.cost })),
          activeGoalKey: firstGoal.id,
        });
        navigation.reset({ index: 0, routes: [{ name: "StartingBudget" }] });
      } catch {
        setSaveError(strings.firstRunSaveFailed);
        setSaving(false);
      }
    };

    return (
      <HowToPlay
        cards={content.hints}
        pet={{
          species: draft.species,
          color: draft.color,
          accessory: draft.accessory,
          petName: draft.petName.trim(),
        }}
        replay={false}
        error={saveError}
        busy={saving}
        onBack={() => setPhase("names")}
        onFinish={finish}
        onClose={finish}
      />
    );
  }

  if (phase === "pet") {
    return (
      <PetPhase
        draft={draft}
        onChange={(change) => setDraft((current) => ({ ...current, ...change }))}
        onNext={() => setPhase("names")}
      />
    );
  }

  return (
    <NamesPhase
      draft={draft}
      playerNameTouched={playerNameTouched}
      petNameTouched={petNameTouched}
      onChange={(change) => setDraft((current) => ({ ...current, ...change }))}
      onPlayerNameBlur={() => setPlayerNameTouched(true)}
      onPetNameBlur={() => setPetNameTouched(true)}
      onBack={() => setPhase("pet")}
      onNext={() => {
        setSaveError(null);
        setPhase("rules");
      }}
    />
  );
}

function PetPhase({
  draft,
  onChange,
  onNext,
}: {
  draft: FirstRunDraft;
  onChange: (change: Partial<Pick<FirstRunDraft, "species" | "color" | "accessory">>) => void;
  onNext: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>{strings.firstRunPet}</Text>
      <PetView
        species={draft.species}
        color={draft.color}
        accessory={draft.accessory}
        pose="idle"
      />
      <ChipRow
        legend={strings.speciesLegend}
        keys={SPECIES_KEYS}
        labelOf={strings.speciesName}
        value={draft.species}
        onChange={(species) => onChange({ species })}
      />
      <ChipRow
        legend={strings.colorLegend}
        keys={COLOR_KEYS}
        labelOf={strings.colorName}
        value={draft.color}
        onChange={(color) => onChange({ color })}
      />
      <ChipRow
        legend={strings.accessoryLegend}
        keys={ACCESSORY_KEYS}
        labelOf={strings.accessoryName}
        value={draft.accessory}
        onChange={(accessory) => onChange({ accessory })}
      />
      <PrimaryButton label={strings.next} onPress={onNext} />
    </ScrollView>
  );
}

function NamesPhase({
  draft,
  playerNameTouched,
  petNameTouched,
  onChange,
  onPlayerNameBlur,
  onPetNameBlur,
  onBack,
  onNext,
}: {
  draft: FirstRunDraft;
  playerNameTouched: boolean;
  petNameTouched: boolean;
  onChange: (change: Partial<Pick<FirstRunDraft, "playerName" | "petName">>) => void;
  onPlayerNameBlur: () => void;
  onPetNameBlur: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const namesValid = isValidName(draft.playerName) && isValidName(draft.petName);
  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{strings.firstRunNames}</Text>
      <PetView
        species={draft.species}
        color={draft.color}
        accessory={draft.accessory}
        petName={draft.petName.trim() || undefined}
        pose="idle"
      />
      <Text style={styles.legend}>{strings.playerNameLabel}</Text>
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.playerNameLabel}
        value={draft.playerName}
        onChangeText={(playerName) => onChange({ playerName })}
        onBlur={onPlayerNameBlur}
        style={styles.input}
      />
      {playerNameTouched && !isValidName(draft.playerName) ? (
        <Text style={styles.validation}>{strings.nameValidation}</Text>
      ) : null}
      <Text style={styles.legend}>{strings.petNameLabel}</Text>
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.petNameLabel}
        value={draft.petName}
        onChangeText={(petName) => onChange({ petName })}
        onBlur={onPetNameBlur}
        style={styles.input}
      />
      {petNameTouched && !isValidName(draft.petName) ? (
        <Text style={styles.validation}>{strings.nameValidation}</Text>
      ) : null}
      <PrimaryButton label={strings.back} onPress={onBack} />
      <PrimaryButton label={strings.next} disabled={!namesValid} onPress={onNext} />
    </ScrollView>
  );
}

function isValidName(value: string): boolean {
  const length = Array.from(GRAPHEME_SEGMENTER.segment(value.trim())).length;
  return length >= 1 && length <= 20;
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
    flexGrow: 1,
    gap: spacing.m,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
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
  validation: {
    color: colors.text,
    fontSize: type.body,
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
