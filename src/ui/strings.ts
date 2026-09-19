/**
 * Single home for RU user-facing strings (ROADMAP §3). Vocabulary must match
 * CONTEXT.md; body text stays ≥16 sp per the UX constraints.
 */
const SPECIES_NAMES: Record<string, string> = {
  sp1: "Вид 1",
  sp2: "Вид 2",
  sp3: "Вид 3",
};

const COLOR_NAMES: Record<string, string> = {
  c1: "Окрас 1",
  c2: "Окрас 2",
  c3: "Окрас 3",
};

const ACCESSORY_NAMES: Record<string, string> = {
  a1: "Аксессуар 1",
  a2: "Аксессуар 2",
  a3: "Аксессуар 3",
};

const POSE_NAMES = {
  idle: "спокойный",
  happy: "весёлый",
  sad: "грустный",
} as const;

export const strings = {
  appName: "ФинПет",
  versionLine: (version: string, build: number) => `версия ${version} (${build})`,

  skip: "Пропустить",
  next: "Дальше",
  play: "Играть!",
  playTask: "Играть",
  gotIt: "Понятно",
  done: "Готово",
  close: "Закрыть",
  back: "Назад",
  howToPlay: "Как играть",
  settings: "Настройки",
  deleteProfile: "Удалить профиль",
  devSection: "Dev",
  finishDay: "Закончить день",
  composePlanHint: "Составь план дня",
  finishDayNeedPlan: "Сначала составь план дня",
  allowanceRibbon: "Пособие +10 монет",

  firstRunPet: "Питомец",
  firstRunNames: "Имена",
  howToPlayStep: (step: number, total: number) => `Шаг ${step} из ${total}`,
  petSays: (petName: string, message: string) => `Питомец ${petName} говорит: ${message}`,
  nameValidation: "Введи от 1 до 20 символов",
  firstRunSaveFailed: "Не получилось начать игру. Попробуй ещё раз.",
  playerNameLabel: "Как тебя зовут в игре?",
  petNameLabel: "Как зовут питомца?",
  speciesLegend: "Вид",
  colorLegend: "Окрас",
  accessoryLegend: "Аксессуар",
  speciesName: (key: string) => SPECIES_NAMES[key] ?? key,
  colorName: (key: string) => COLOR_NAMES[key] ?? key,
  accessoryName: (key: string) => ACCESSORY_NAMES[key] ?? key,

  startingBudgetTitle: "Тебе дали 100 монет на старт!",
  startingBudgetBody: "Это твой бюджет. Планируй, копи, заботься о питомце",

  care: "Забота",
  mood: "Настроение",
  meterLine: (label: string, value: number) => `${label} ${value}`,
  balanceBadge: (n: number) => `Баланс ${n}`,
  savingsBadge: (n: number) => `Копилка ${n}`,
  goalRatio: (have: number, cost: number) => `${have} / ${cost}`,
  goalRemaining: (n: number) => `осталось ${n}`,
  stageIcon: "★",
  poseIdle: POSE_NAMES.idle,
  poseHappy: POSE_NAMES.happy,
  poseSad: POSE_NAMES.sad,
  petA11y: (input: {
    petName?: string;
    species: string;
    color: string;
    accessory: string;
    pose: keyof typeof POSE_NAMES;
  }) => {
    const who = input.petName ? `Питомец ${input.petName}` : "Питомец";
    return `${who}, ${SPECIES_NAMES[input.species] ?? input.species}, ${COLOR_NAMES[input.color] ?? input.color}, ${ACCESSORY_NAMES[input.accessory] ?? input.accessory}, ${POSE_NAMES[input.pose]}`;
  },

  navPlan: "План",
  navShop: "Магазин",
  navSavings: "Копилка",
  navTasks: "Задания",
  navProgress: "Прогресс",
  navAdult: "Взрослый раздел",

  glossaryTitle: "Словарик",
  stubPlan: "Скоро: план дня. Пока вернись на главный экран.",
  stubShop: "Скоро: магазин. Пока вернись на главный экран.",
  stubSavings: "Скоро: копилка. Пока вернись на главный экран.",
  stubTasks: "Скоро: задания. Пока вернись на главный экран.",
  stubAdult: "Скоро: взрослый раздел. Пока вернись на главный экран.",
} as const;
