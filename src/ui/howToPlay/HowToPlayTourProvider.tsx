import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { META_KEYS } from "../../data/metaKeys";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { preferredHubTask } from "../tasks/model";
import { TASK_BEAT_ID, TOUR_BEATS, type TourAnchorRect, type TourBeatId } from "./beats";

export type HowToPlayTourApi = {
  active: boolean;
  beatId: TourBeatId | null;
  body: string;
  anchor: TourAnchorRect | null;
  start: (opts?: { replay?: boolean }) => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  setAnchor: (id: string, rect: TourAnchorRect) => void;
};

const HowToPlayTourContext = createContext<HowToPlayTourApi | null>(null);

type Running = { beats: TourBeatId[]; index: number };

export function HowToPlayTourProvider({
  navigationRef,
  children,
}: {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  children: ReactNode;
}) {
  const { content, game, meta } = useSession();
  const [running, setRunning] = useState<Running | null>(null);
  const [anchors, setAnchors] = useState<Partial<Record<string, TourAnchorRect>>>({});

  const beatId = running ? running.beats[running.index] ?? null : null;
  const body = beatId ? (content.hints.find((hint) => hint.id === beatId)?.body ?? "") : "";
  const active = running !== null;

  const goToBeat = useCallback(
    (id: TourBeatId) => {
      const beat = TOUR_BEATS.find((item) => item.id === id);
      if (!beat || !navigationRef.isReady()) return;
      if (navigationRef.getCurrentRoute()?.name === beat.route) return;
      navigationRef.navigate(beat.route);
    },
    [navigationRef],
  );

  useEffect(() => {
    if (!beatId) return;
    goToBeat(beatId);
  }, [beatId, goToBeat]);

  const finish = useCallback(() => {
    meta.set(META_KEYS.howToPlayDone, "1");
    setRunning(null);
    setAnchors({});
    if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== "Main") {
      navigationRef.navigate("Main");
    }
  }, [meta, navigationRef]);

  const start = useCallback(
    (_opts?: { replay?: boolean }) => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      let beats: TourBeatId[] = TOUR_BEATS.map((beat) => beat.id);
      if (profileId) {
        const profile = game.getProfile(profileId);
        const day = game.dayState(profileId);
        const task = preferredHubTask(
          content.tasks,
          day.n,
          profile.isDemo,
          game.listTaskProgress(profileId),
        );
        if (!task) beats = beats.filter((id) => id !== TASK_BEAT_ID);
      } else {
        beats = beats.filter((id) => id !== TASK_BEAT_ID);
      }
      setAnchors({});
      setRunning({ beats, index: 0 });
    },
    [content.tasks, game, meta],
  );

  const next = useCallback(() => {
    if (!running) return;
    if (running.index >= running.beats.length - 1) {
      finish();
      return;
    }
    setRunning({ ...running, index: running.index + 1 });
  }, [finish, running]);

  const back = useCallback(() => {
    if (!running) return;
    if (running.index === 0) {
      finish();
      return;
    }
    setRunning({ ...running, index: running.index - 1 });
  }, [finish, running]);

  const setAnchor = useCallback((id: string, rect: TourAnchorRect) => {
    setAnchors((current) => {
      const prev = current[id];
      if (
        prev &&
        prev.x === rect.x &&
        prev.y === rect.y &&
        prev.width === rect.width &&
        prev.height === rect.height
      ) {
        return current;
      }
      return { ...current, [id]: rect };
    });
  }, []);

  const value = useMemo<HowToPlayTourApi>(
    () => ({
      active,
      beatId,
      body,
      anchor: beatId ? (anchors[beatId] ?? null) : null,
      start,
      next,
      back,
      skip: finish,
      setAnchor,
    }),
    [active, anchors, back, beatId, body, finish, next, setAnchor, start],
  );

  return <HowToPlayTourContext.Provider value={value}>{children}</HowToPlayTourContext.Provider>;
}

export function useHowToPlayTour(): HowToPlayTourApi {
  const value = useContext(HowToPlayTourContext);
  if (!value) {
    throw new Error("useHowToPlayTour must be used inside HowToPlayTourProvider");
  }
  return value;
}
