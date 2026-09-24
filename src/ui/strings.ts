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
  howToPlayTap: "Нажми",
  howToPlayTapCursor: "👆",
  settings: "Настройки",
  settingsIcon: "⚙",
  deleteProfile: "Удалить профиль",
  devSection: "Dev",
  finishDay: "Закончить день",
  composePlanHint: "Составь план дня",
  planReady: "План готов",
  finishDayNeedPlan: "Сначала составь план дня",
  daySummaryTitle: "Итоги дня",
  waitTomorrow: "Ждём завтра!",
  nextDay: "Следующий день",
  waitingBanner: "Новый день откроется завтра",
  waitingEconomyHint: "Откроется завтра",
  waitingLockIcon: "⏳",
  scoreMandatory: "Обязательные",
  scoreWithinPlan: "По плану",
  scoreDeposit: "Копилка",
  scoreYesIcon: "✅",
  scoreNoIcon: "⚠️",
  scoreFact: (word: string, points: number) => `${word} ${points > 0 ? `+${points}` : "+0"}`,
  meterReasonMoodOverspend: "Настроение -5: желаемое сверх плана.",
  meterReasonUnchanged: (label: string) => `${label} без изменений`,
  nextDayPlanNeeds: "Завтра сначала запланируй обязательное.",
  allowanceRibbon: "Пособие +20 монет",
  allowanceDayChip: "Начало игрового дня",

  feedbackBalance: (n: number) => `Баланс ${n > 0 ? "+" : ""}${n}`,
  feedbackSavings: (n: number) => `Копилка ${n > 0 ? "+" : ""}${n}`,
  feedbackCare: (n: number) => `Забота ${n > 0 ? "+" : ""}${n}`,
  feedbackMood: (n: number) => `Настроение ${n > 0 ? "+" : ""}${n}`,
  feedbackCauseAllowance: "Потому что начался новый игровой день.",
  feedbackNextAllowance: "Что дальше: составь план дня.",
  feedbackCausePurchase: "Потому что ты купил вещь для питомца.",
  feedbackNextPurchase: "Что дальше: сверься с планом или отложи в копилку.",
  feedbackCauseSavingsIn: "Потому что ты положил монеты в копилку.",
  feedbackNextSavingsIn: "Что дальше: копи дальше или вернись к плану дня.",
  feedbackCauseSavingsOut: "Потому что ты забрал монеты из копилки.",
  feedbackNextSavingsOut: "Что дальше: подумай, нужна ли трата сегодня.",
  feedbackCauseGoal: "Потому что копилка дошла до цели.",
  feedbackNextGoal: "Что дальше: выбери новую цель, если хочешь копить снова.",
  feedbackCauseTaskReward: "Потому что ты выполнил задание.",
  feedbackNextTaskReward: "Что дальше: выбери ещё задание или вернись в магазин.",
  feedbackCauseTaskScene: "Потому что в задании нашлись монеты.",
  feedbackNextTaskScene: "Что дальше: проверь сдачу и иди дальше.",

  taskTopicBudget: "Бюджет",
  taskTopicSavings: "Копилки",
  taskTopicPayments: "Платежи",
  taskTopicBudgetIcon: "📋",
  taskTopicSavingsIcon: "🐷",
  taskTopicPaymentsIcon: "🪙",
  mapTitle: "Карта заданий",
  mapHint: "Нажми на точку, чтобы узнать о задании.",
  missionStart: "Начать",
  missionReplay: "Пройти ещё раз",
  missionDistrict: (district: string) => `Район: ${district}`,
  missionDifficulty: (n: number) => `Сложность: ${"★".repeat(n)}${"☆".repeat(Math.max(0, 3 - n))}`,
  missionRewardMax: (max: number) => `Награда: до ${max} монет`,
  missionRewardBest: (best: number, max: number) => `Лучший результат: ${best} из ${max} монет`,
  missionRewardLeft: (left: number) =>
    left > 0 ? `За лучший ответ можно получить ещё ${left}` : "Ты собрал все монеты за это задание",
  missionLockedAfter: (title: string) => `Откроется после «${title}»`,
  missionPinA11y: (title: string, state: "locked" | "open" | "done") =>
    `${title}, ${state === "locked" ? "закрыто" : state === "done" ? "пройдено" : "открыто"}`,
  missionCorrections: "Исправить ошибку",
  taskCardNext: "Дальше",
  taskSortPrompt: "Куда это отнести?",
  taskSortProgress: (n: number, total: number) => `${n} из ${total}`,
  taskScore: (points: string, total: number) => `Верно с первого раза: ${points} из ${total}`,
  taskEarned: (n: number) => `+${n} ${coinsWord(n)}`,
  taskNoTopUp: "Новых монет нет — это не лучше прошлого результата.",
  taskBackToMap: "На карту",
  taskSpawned: "Новое задание появилось в списке!",
  verdictLabel: (verdict: "good" | "warn" | "bad") => {
    if (verdict === "good") return "✅ Верно";
    if (verdict === "warn") return "🤔 Есть цена";
    return "⚠️ Попробуй ещё";
  },

  shopMandatoryTab: "Обязательное",
  shopOptionalTab: "Желаемое",
  shopPrice: (n: number) => `${n} монет`,
  shopCategory: (kind: "mandatory" | "optional") =>
    kind === "mandatory" ? "Обязательные" : "Желаемые",
  shopAfterBuy: (n: number) => `после покупки: ${n} монет`,
  shopImpact: (meter: string, delta: number) => `эффект: ${meter} +${delta}`,
  shopBought: "Куплено",
  shopBuy: "Купить",
  shopPostpone: "Отложить",
  shopMakeGoal: "Сделать целью",
  shopBuyFromSavings: "Купить из копилки",
  shopOnceLabel: "Можно купить один раз",
  shopConfirmBuy: (name: string, price: number) => `Купить ${name} за ${price}?`,
  shopConfirmReplaceGoal: (name: string, pot: number) =>
    `Цель станет ${name}. В копилке останется ${pot}.`,
  shopBuyActiveGoalWarn: (pot: number) =>
    `Это твоя Цель. После покупки Цель снимется, в копилке останется ${pot}.`,
  shopBlocked: (n: number) => `Не хватает ${n} монет`,
  shopBlockedAlreadyGoal: "Это уже твоя Цель. Копи дальше в Копилке.",
  shopWaitAllowance: "Дождаться пособия",
  shopDoTask: "Выполнить задание",
  shopWaitExplain: "Пособие придёт в следующий игровой день. Можно сделать задание или отложить покупку.",

  goalPickerTitle: "Выбери цель",
  goalDrop: "Без цели",
  goalEmptyPrompt: "Выбери цель",
  pickNewGoal: "Выбрать новую цель",

  savingsPot: (n: number) => `В копилке ${n}`,
  savingsEstimateNone: "—",
  savingsEstimate: (n: number) => `примерно ${n} дн.`,
  savingsDeposit: "Положить",
  savingsWithdraw: "Забрать",
  savingsDepositAmount: "Сумма",
  savingsConfirmDeposit: (n: number) => `Положить ${n}?`,
  savingsConfirmWithdraw: (n: number) => `Забрать ${n}?`,
  savingsWithdrawPreview: (potAfter: number, days: number) =>
    `В копилке станет ${potAfter}. Мечта отодвинется на ${days} дн.`,
  savingsWithdrawPreviewNone: (potAfter: number) => `В копилке станет ${potAfter}.`,
  savingsAchieved: "Мечта сбылась!",
  savingsConfetti: "🎉",
  savingsPickGoal: "Выбери цель",
  savingsChooseGoal: "Выбери цель",
  savingsChooseNewGoal: "Выбрать новую цель",
  savingsBuyFromSavings: "Купить из копилки",
  savingsLater: "Позже",
  savingsDropGoal: "Убрать цель",
  savingsConfirmReplace: (name: string, pot: number) =>
    `Цель станет ${name}. В копилке останется ${pot}.`,
  savingsAchievedBadge: "сбылась",
  savingsRemaining: (n: number) => `осталось ${n}`,

  tabResults: "Итоги",
  tabJournal: "Журнал",
  tabGlossary: "Словарик",
  resultsEmpty: "Итоги появятся после первого закрытого игрового дня.",
  resultsLastDay: (n: number) => `Игровой день ${n}`,
  resultsScore: (n: number) => `Итог ${n}`,
  resultsOverall: "Всего",
  resultsDaysPlayed: (n: number) => `Игровых дней: ${n}`,
  resultsTasksDone: (done: number, total: number) => `Задания ${done}/${total}`,
  resultsGoalsAchieved: (n: number) => `Целей: ${n}`,
  resultsScoreMandatory: (earned: boolean) => (earned ? "Обязательные +2" : "Обязательные 0"),
  resultsScoreWithinPlan: (earned: boolean) => (earned ? "По плану +1" : "По плану 0"),
  scoreDeposited: (earned: boolean) => (earned ? "Копилка +1" : "Копилка 0"),
  meterReasonSkippedMandatory: (n: number) => `Забота ${n}: пропущены обязательные расходы`,
  meterReasonOptionalOverspend: (n: number) => `Настроение ${n}: желаемое больше плана`,
  meterReasonNoChange: "Забота и настроение без изменений",
  journalStart: "Старт",
  journalDay: (n: number) => `День ${n}`,
  journalStartingGrant: "Стартовый бюджет",
  journalAllowance: "Пособие",
  journalPurchase: (name: string) => `Покупка: ${name}`,
  journalSavingsIn: "Перевод в копилку",
  journalSavingsOut: "Из копилки",
  journalTaskReward: (title: string) => `Задание: ${title}`,
  journalTaskScene: "Задание",
  journalAmount: (n: number) => `${n > 0 ? "+" : ""}${n}`,

  planAvailable: (n: number) => `Можно распределить: ${n}`,
  planIncomeToday: (n: number) => `Сегодня пришло: +${n}`,
  planBillsTitle: "Счета на сегодня",
  planBillsLine: (parts: readonly { name: string; price: number }[], total: number) =>
    `${parts.map((part) => `${part.name} ${part.price}`).join(" · ")} = ${total}`,
  planBillsFloor: (n: number) => `Обязательных не меньше ${n} — это счета.`,
  planBillsShort: (missing: number) =>
    `На все счета не хватает ${missing}. Сделай Задание — за него дают монеты.`,
  planGoalForecast: (goal: string, days: number) =>
    `${goal}: накопишь через ${days} ${daysWord(days)}, если откладывать столько каждый день.`,
  planGoalNoSavings: (goal: string) => `Если ничего не отложить, ${goal} не станет ближе.`,
  planWantsHint: (names: readonly string[]) =>
    names.length > 0 ? `Хватит на: ${names.join(", ")}` : "Пока ни на что из желаемого не хватит.",
  planRemainder: (n: number) => `Останется свободных: ${n}`,
  planOverBudget: "В плане больше монет, чем есть. Убавь суммы.",
  planPromise: "Это обещание на сегодня. Монеты пока в Балансе.",
  planSavingsExtra: "Положишь их отдельно — в Копилке.",
  confirmPlan: "Подтвердить план",
  confirmPlanTitle: "Подтвердить план дня?",
  confirmPlanBody:
    "Это обещание. Монеты останутся в Балансе, пока ты не купишь в Магазине или не положишь в Копилку. Потом план не меняется.",
  planYesterday: (n: number) => `вчера ${n}`,
  planLeftover: (n: number) => `Осталось ${n}`,
  planOvershoot: (n: number) => `сверх плана ${n}`,
  planLeftoverA11y: (label: string, leftover: number) =>
    leftover >= 0 ? `${label}: осталось ${leftover}` : `${label}: сверх плана ${Math.abs(leftover)}`,
  planAfterTap: (n: number) => `в плане останется ${n}`,
  planOverWarn: "Это сверх плана.",
  planColPlan: "план",
  planColActual: "потрачено",
  bucketMandatory: "Обязательные",
  bucketOptional: "Желаемые",
  bucketSavings: "Копилка",
  bucketMinus: (label: string) => `${label}, меньше`,
  bucketPlus: (label: string) => `${label}, больше`,
  bucketValue: (label: string, n: number) => `${label} ${n}`,
  planVsActual: (plan: number, actual: number) => `план ${plan} · потрачено ${actual}`,

  firstRunPet: "Питомец",
  howToPlayStep: (step: number, total: number) => `Шаг ${step} из ${total}`,
  petSays: (petName: string, message: string) => `Питомец ${petName} говорит: ${message}`,
  namePrompt: "Меня зовут",
  nameBlank: "____",
  namePen: "✏️",
  nameValidation: "Введи от 1 до 20 символов",
  firstRunSaveFailed: "Не получилось начать игру. Попробуй ещё раз.",
  speciesLegend: "Вид",
  speciesPictogram: "🐣",
  colorLegend: "Окрас",
  colorPictogram: "🎨",
  accessoryLegend: "Аксессуар",
  accessoryPictogram: "🎀",
  speciesName: (key: string) => SPECIES_NAMES[key] ?? key,
  colorName: (key: string) => COLOR_NAMES[key] ?? key,
  accessoryName: (key: string) => ACCESSORY_NAMES[key] ?? key,

  startingBudgetTitle: "Тебе дали 100 монет на старт!",
  startingBudgetBody: "Это твой бюджет. Планируй, копи, заботься о питомце",

  care: "Забота",
  careIcon: "🐾",
  mood: "Настроение",
  moodIcon: "☀",
  meterLine: (label: string, value: number) => `${label} ${value}`,
  balanceWord: "Баланс",
  savingsWord: "Копилка",
  stageWord: "Этап",
  stageA11y: (name: string) => `Этап ${name}`,
  balanceBadge: (n: number) => `Баланс ${n}`,
  savingsBadge: (n: number) => `Копилка ${n}`,
  goalRatio: (have: number, cost: number) => `${have} / ${cost}`,
  goalRemaining: (n: number) => `осталось ${n}`,
  selectedCheck: "✓",
  stageIcon: "★",
  balanceIcon: "🪙",
  savingsIcon: "🐷",
  navPlanPictogram: "📋",
  navShopPictogram: "🛒",
  navSavingsPictogram: "🐷",
  navTasksPictogram: "🎯",
  navProgressPictogram: "📚",
  navAdultPictogram: "👤",
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
  adultGatePrompt: (a: number, b: number) => `Сколько будет ${a} × ${b}?`,
  adultGateAnswer: "Ответ",
  adultGateEnter: "Войти",

  demoMode: "Демо-режим",
  demoName: "Демо",
  demoConfirmBody: "Демо создаёт отдельный тестовый профиль",
  demoResetConfirmBody: "Демо вернётся к первому игровому дню",
  demoBanner: "Демо: дни идут подряд",
  demoReset: "Сбросить демо",
  adultDaysEmpty: "Игровых дней пока нет — это нормально.",
  adultTopicLine: (topic: string, done: number, total: number) => {
    if (done === 0) return `${topic}: ещё впереди`;
    if (done >= total) return `${topic}: все задания сделаны`;
    return `${topic}: сделано ${done} из ${total}`;
  },
  resetProgress: "Сбросить прогресс",
  resetProgressBody: "Прогресс сбросится, имена и вид питомца останутся.",
  resetProgressTypedLabel: "Введи: сбросить",
  resetProgressWord: "сбросить",
  deleteProfileBody: "Питомец и все игровые дни пропадут с устройства.",
  deleteProfileTypedLabel: "Введи: удалить",
  deleteProfileWord: "удалить",

  glossaryTitle: "Словарик",
  stubPlan: "Скоро: план дня. Пока вернись на главный экран.",
  stubShop: "Скоро: магазин. Пока вернись на главный экран.",
  stubSavings: "Скоро: копилка. Пока вернись на главный экран.",
  stubTasks: "Скоро: задания. Пока вернись на главный экран.",
  stubAdult: "Скоро: взрослый раздел. Пока вернись на главный экран.",
} as const;

/** «1 день / 3 дня / 5 дней». */
function daysWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

/** «1 монета / 3 монеты / 5 монет». */
function coinsWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "монет";
  if (mod10 === 1) return "монета";
  if (mod10 >= 2 && mod10 <= 4) return "монеты";
  return "монет";
}
