export type ArchetypeStyle = {
  name: string;
  descriptionShort: string;
  yearColor: string;
  yearGradient?: string;
  crystalName: string;
  crystalDescription: string;
  iconHint: string;
  svgPath: string; // Added for visual representation
  monthAccent?: string[];
  dayAccentStrategy?: 'border' | 'icon' | 'backgroundTint';
};

export const archetypeStyles: Record<number, ArchetypeStyle> = {
  1: {
    name: 'Маг',
    descriptionShort: 'Год начала нового цикла, проявления воли и старта важных проектов.',
    yearColor: '#1DD1A1',
    yearGradient: 'linear-gradient(135deg, #00CEC9, #1DD1A1)',
    crystalName: 'Цитрин / Тигровый глаз',
    crystalDescription: 'Камни личной силы и проявления намерений, помогают запускать новые проекты и верить в себя.',
    iconHint: 'Кристалл с четырьмя лучами или стилизованная палочка/жезл с искрой.',
    svgPath: 'M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z', // Star-like crystal
    dayAccentStrategy: 'border'
  },
  2: {
    name: 'Верховная Жрица',
    descriptionShort: 'Год интуиции, партнерства и накопления знаний.',
    yearColor: '#3498DB',
    yearGradient: 'linear-gradient(135deg, #74B9FF, #3498DB)',
    crystalName: 'Луннный камень',
    crystalDescription: 'Помогает раскрыть интуицию и найти баланс в отношениях.',
    iconHint: 'Полумесяц или чаша.',
    svgPath: 'M12 2C7.03 2 3 6.03 3 11C3 15.97 7.03 20 12 20C12.34 20 12.67 19.98 13 19.94C10.07 18.75 8 15.62 8 12C8 8.38 10.07 5.25 13 4.06C12.67 4.02 12.34 4 12 4V2Z', // Crescent moon
    dayAccentStrategy: 'border'
  },
  3: {
    name: 'Императрица',
    descriptionShort: 'Год творчества, изобилия и реализации идей.',
    yearColor: '#F368E0',
    yearGradient: 'linear-gradient(135deg, #FD79A8, #F368E0)',
    crystalName: 'Розовый кварц',
    crystalDescription: 'Камень любви и творчества, способствует росту и процветанию.',
    iconHint: 'Цветок или зерно.',
    svgPath: 'M12 22C12 22 20 13 20 8C20 3.58 16.42 0 12 0C7.58 0 4 3.58 4 8C4 13 12 22 12 22Z', // Flower/Seed shape
    dayAccentStrategy: 'border'
  },
  4: {
    name: 'Император',
    descriptionShort: 'Год структуры, дисциплины и укрепления фундамента.',
    yearColor: '#FF4D4D',
    yearGradient: 'linear-gradient(135deg, #FF7675, #FF4D4D)',
    crystalName: 'Гранат / Гематит',
    crystalDescription: 'Дает заземление и силы для построения прочных структур.',
    iconHint: 'Квадрат или щит.',
    svgPath: 'M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z', // Shield
    dayAccentStrategy: 'border'
  },
  5: {
    name: 'Иерофант',
    descriptionShort: 'Год обучения, передачи опыта и поиска смысла.',
    yearColor: '#F9CA24',
    yearGradient: 'linear-gradient(135deg, #F9E79F, #F9CA24)',
    crystalName: 'Янтарь',
    crystalDescription: 'Символ мудрости и связи с традициями.',
    iconHint: 'Ключ или книга.',
    svgPath: 'M21 11.5C21 13.93 19.03 15.9 16.6 15.9C15.14 15.9 13.86 15.19 13.07 14.1L11 16.17V18.24L8.93 20.31L6.86 18.24L4.79 20.31L2 17.52L4.07 15.45H6.14V13.38L13.07 6.45C13.86 5.36 15.14 4.65 16.6 4.65C19.03 4.65 21 6.62 21 9.05V11.5Z', // Key
    dayAccentStrategy: 'border'
  },
  6: {
    name: 'Влюбленные',
    descriptionShort: 'Год выбора, гармонии и ответственности за свои решения.',
    yearColor: '#A29BFE',
    yearGradient: 'linear-gradient(135deg, #D6D1FF, #A29BFE)',
    crystalName: 'Изумруд',
    crystalDescription: 'Помогает в сердечных делах и выборе истинного пути.',
    iconHint: 'Два переплетенных кольца.',
    svgPath: 'M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z', // Heart/Rings
    dayAccentStrategy: 'border'
  },
  7: {
    name: 'Колесница',
    descriptionShort: 'Год прорыва, путешествий и достижения целей.',
    yearColor: '#48DBFB',
    yearGradient: 'linear-gradient(135deg, #81ECEC, #48DBFB)',
    crystalName: 'Аквамарин',
    crystalDescription: 'Камень смелости и ясного видения цели.',
    iconHint: 'Стрела или колесо.',
    svgPath: 'M2.1 14.9L11 10.5V2L22 12L11 22V13.5L2.1 17.9V14.9Z', // Arrow
    dayAccentStrategy: 'border'
  },
  8: {
    name: 'Сила',
    descriptionShort: 'Год проверки на прочность, управления ресурсами и кармы.',
    yearColor: '#FF9F43',
    yearGradient: 'linear-gradient(135deg, #FAB1A0, #FF9F43)',
    crystalName: 'Пирит',
    crystalDescription: 'Привлекает удачу и дает волю к победе.',
    iconHint: 'Бесконечность или лев.',
    svgPath: 'M14.5 7C14.5 5.34 13.16 4 11.5 4C9.84 4 8.5 5.34 8.5 7C8.5 8.66 9.84 10 11.5 10C13.16 10 14.5 8.66 14.5 7ZM18.5 7C18.5 10.87 15.37 14 11.5 14C7.63 14 4.5 10.87 4.5 7C4.5 3.13 7.63 0 11.5 0C15.37 0 18.5 3.13 18.5 7ZM14.5 17C14.5 15.34 13.16 14 11.5 14C9.84 14 8.5 15.34 8.5 17C8.5 18.66 9.84 20 11.5 20C13.16 20 14.5 18.66 14.5 17ZM18.5 17C18.5 20.87 15.37 24 11.5 24C7.63 24 4.5 20.87 4.5 17C4.5 13.13 7.63 10 11.5 10C15.37 10 18.5 13.13 18.5 17Z', // Infinity/Strength
    dayAccentStrategy: 'border'
  },
  9: {
    name: 'Отшельник',
    descriptionShort: 'Год завершения, анализа, внутреннего пути и очищения.',
    yearColor: '#54A0FF',
    yearGradient: 'linear-gradient(135deg, #2E3A59, #54A0FF)',
    crystalName: 'Сапфир / Содалит',
    crystalDescription: 'Камни мудрости и внутренней концентрации, помогают углубиться в себя и увидеть главное.',
    iconHint: 'Небольшой фонарь или кристалл в форме вытянутого шестиугольника с мягким светом внутри.',
    svgPath: 'M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z', // Lantern/Crystal
    dayAccentStrategy: 'border'
  }
};
