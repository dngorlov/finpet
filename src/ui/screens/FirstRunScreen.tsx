import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text, TextInput, View, type Role } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createLocalId } from "../../data/localId";
import { BeadSlider } from "../components/BeadSlider";
import { HowToPlay } from "../components/HowToPlay";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { SpeechBubble } from "../components/SpeechBubble";
import { TextButton } from "../components/TextButton";
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
type Phase = "pet" | "name" | "rules";
type FirstRunDraft = {
  profileId: string;
  species: SpeciesKey;
  color: ColorKey;
  accessory: AccessoryKey;
  petName: string;
};

const TEXTBOX_ROLE = "textbox" as Role;

export default function FirstRunScreen({ navigation }: Props) {
  const { content, firstRun } = useSession();
  const [phase, setPhase] = useState<Phase>("pet");
  const [draft, setDraft] = useState<FirstRunDraft>(() => ({
    profileId: createLocalId("profile"),
    species: "sp1",
    color: "c1",
    accessory: "a1",
    petName: "",
  }));
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
          name: draft.petName.trim(),
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
        onBack={() => setPhase("name")}
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
        onNext={() => setPhase("name")}
      />
    );
  }

  return (
    <NamePhase
      draft={draft}
      petNameTouched={petNameTouched}
      onChange={(change) => setDraft((current) => ({ ...current, ...change }))}
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
    <Screen footer={<PrimaryButton label={strings.next} onPress={onNext} />}>
      <Text style={styles.title}>{strings.firstRunPet}</Text>
      <PetView
        species={draft.species}
        color={draft.color}
        accessory={draft.accessory}
        pose="idle"
      />
      <View style={styles.sliders}>
        <BeadSlider
          legend={strings.speciesLegend}
          pictogram={strings.speciesPictogram}
          keys={SPECIES_KEYS}
          labelOf={strings.speciesName}
          value={draft.species}
          onChange={(species) => onChange({ species })}
        />
        <BeadSlider
          legend={strings.colorLegend}
          pictogram={strings.colorPictogram}
          keys={COLOR_KEYS}
          labelOf={strings.colorName}
          value={draft.color}
          onChange={(color) => onChange({ color })}
        />
        <BeadSlider
          legend={strings.accessoryLegend}
          pictogram={strings.accessoryPictogram}
          keys={ACCESSORY_KEYS}
          labelOf={strings.accessoryName}
          value={draft.accessory}
          onChange={(accessory) => onChange({ accessory })}
        />
      </View>
    </Screen>
  );
}

function nameIntro(value: string): string {
  return value.trim() === "" ? strings.nameIntroEmpty : strings.nameIntro(value);
}

function NamePhase({
  draft,
  petNameTouched,
  onChange,
  onPetNameBlur,
  onBack,
  onNext,
}: {
  draft: FirstRunDraft;
  petNameTouched: boolean;
  onChange: (change: Partial<Pick<FirstRunDraft, "petName">>) => void;
  onPetNameBlur: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const intro = nameIntro(draft.petName);
  return (
    <Screen
      keyboardShouldPersistTaps="handled"
      footer={
        <>
          <TextButton label={strings.back} onPress={onBack} />
          <PrimaryButton label={strings.next} disabled={!isValidName(draft.petName)} onPress={onNext} />
        </>
      }
    >
      <Text style={styles.title}>{strings.firstRunName}</Text>
      <PetView
        species={draft.species}
        color={draft.color}
        accessory={draft.accessory}
        pose="idle"
      />
      <SpeechBubble accessibilityLabel={intro}>
        <Text style={styles.body}>{intro}</Text>
      </SpeechBubble>
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.firstRunName}
        autoFocus
        value={draft.petName}
        onChangeText={(petName) => onChange({ petName })}
        onBlur={onPetNameBlur}
        style={styles.input}
      />
      {petNameTouched && !isValidName(draft.petName) ? (
        <Text style={styles.validation}>{strings.nameValidation}</Text>
      ) : null}
    </Screen>
  );
}

function graphemeLength(value: string): number {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter("ru", { granularity: "grapheme" }).segment(value)).length;
  }
  return Array.from(value).length;
}

function isValidName(value: string): boolean {
  const length = graphemeLength(value.trim());
  return length >= 1 && length <= 20;
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
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
  sliders: {
    gap: spacing.l,
    paddingTop: spacing.s,
  },
});
