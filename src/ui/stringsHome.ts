/**
 * Copy for the Главная scene, the compact Карта заданий, the Словарик redesign
 * and the Об авторах block in Настройки. Kept apart from strings.ts so parallel
 * screen work does not collide.
 */
export const homeStrings = {
  /** Spoken name of the pet button on Главная (the pet picture keeps its own label). */
  petTalk: (petName: string) => (petName ? `Поговорить с питомцем ${petName}` : "Поговорить с питомцем"),
  petLinesHungry: ["Я бы что-нибудь съел…", "Животик урчит!"],
  petLinesSad: ["Мне немного грустно.", "Давай поиграем?"],
  petLinesHappy: ["Ура, я так рад!", "Ты лучший друг!", "Копим на мечту?", "Сегодня отличный день!"],
  petLinesIdle: ["Привет!", "Пойдём на карту?", "Копим на мечту?", "Что купим сегодня?"],
  goalA11y: (name: string, have: number, cost: number) => `Цель: ${name}, ${have} из ${cost}`,
  mapMore: "Подробнее",
  mapMoreA11y: (title: string) => `Подробнее: ${title}`,
  handbookWordsHint: "Нажми на слово",
  handbookEmptyLessons: "Уроки появятся, когда откроешь их на карте.",
  creditsTitle: "Об авторах и источниках",
  creditsLibraries: "Библиотеки",
  creditsDevTools: "Инструменты разработки",
  creditsTeam: "Команда hsespbteam",
  creditsAi: "ИИ-модели",
  creditsFonts: "Шрифты",
  creditsIcons: "Иконки",
  creditsImages: "Изображения",
  creditsReferences: "Референсы",
  creditsContent: "Образовательный контент",
  creditsLibraryLine: (version: string, license: string) => `${version} · ${license}`,
} as const;
