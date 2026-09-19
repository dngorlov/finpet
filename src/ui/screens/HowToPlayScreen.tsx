import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import { HowToPlay } from "../components/HowToPlay";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";

type Props = NativeStackScreenProps<RootStackParamList, "HowToPlay">;

export default function HowToPlayScreen({ navigation }: Props) {
  const { content, game, meta } = useSession();
  const profileId = meta.get(META_KEYS.activeProfileId);
  if (!profileId) return null;
  const profile = game.getProfile(profileId);

  const close = () => navigation.goBack();
  return (
    <HowToPlay
      cards={content.hints}
      pet={{
        species: profile.species,
        color: profile.color,
        accessory: profile.accessory,
        petName: profile.petName,
      }}
      replay
      onBack={close}
      onFinish={close}
      onClose={close}
    />
  );
}
