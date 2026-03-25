import { User, ArchetypeProfile, YearTheme, QuarterObjective, MonthGoal, WeekFocus, DailyStep, Area } from './types';
import { ARCHETYPES, AREAS, AREA_LABELS } from './constants';

/**
 * ФОРМАЛЬНЫЙ АЛГОРИТМ РАСЧЕТА ПЕРСОНАЛЬНОГО ГОДА:
 * 1. Суммируем: Число дня рождения + Число месяца рождения + Число текущего года (например, 2026).
 * 2. Складываем все цифры полученной суммы до тех пор, пока не получится число от 1 до 9.
 * 3. Полученное число — это номер вашего персонального года в 9-летнем цикле.
 * 4. Каждому числу соответствует свой архетип:
 *    1 - Маг (Начало, инициатива)
 *    2 - Жрица (Интуиция, выбор)
 *    3 - Императрица (Рост, созидание)
 *    4 - Император (Структура, власть)
 *    5 - Иерофант (Обучение, правила)
 *    6 - Влюбленные (Выбор, отношения)
 *    7 - Колесница (Движение, успех)
 *    8 - Сила (Энергия, баланс)
 *    9 - Отшельник (Итоги, мудрость)
 */
export function calculatePersonalYear(birthDate: Date, year: number): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;

  const sumDigits = (n: number): number => {
    let sum = 0;
    while (n > 0 || sum > 9) {
      if (n === 0) {
        n = sum;
        sum = 0;
      }
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    return sum;
  };

  const total = sumDigits(day) + sumDigits(month) + sumDigits(year);
  return sumDigits(total);
}

export function generateArchetypeProfile(userId: string, birthDate: Date, year: number): ArchetypeProfile {
  const personalYear = calculatePersonalYear(birthDate, year);
  const archetype = ARCHETYPES[personalYear];
  
  return {
    userId,
    year,
    personalYearNumber: personalYear,
    personalYearArchetypeName: archetype.name,
    personalYearDescription: archetype.description,
    themesByArea: archetype.themes,
    recommendedBooks: archetype.recommendedBooks,
  };
}

export function generateYearTheme(user: User, profile: ArchetypeProfile): YearTheme {
  const generalAdvice = profile.personalYearDescription;
  const specificAdvice = `Как ${user.profession || 'специалист'}, в этом году сфокусируйтесь на: ${(user.focusAreas || []).join(', ') || 'своих приоритетах'}. Ваши проекты (${(user.currentProjects || []).join(', ') || 'текущие задачи'}) получат поддержку через энергию архетипа ${profile.personalYearArchetypeName}.`;

  return {
    id: `yt-${user.id}-${profile.year}`,
    userId: user.id,
    year: profile.year,
    title: `Год ${profile.personalYearArchetypeName}: ${profile.personalYearArchetypeName}`,
    description: `### Общие рекомендации\n${generalAdvice}\n\n### Конкретные шаги\n${specificAdvice}`,
    areaThemes: profile.themesByArea,
    recommendedBooks: profile.recommendedBooks,
  };
}

export function generateQuarterObjectives(yearTheme: YearTheme, user: User, personalYearNumber: number): QuarterObjective[] {
  const projects = user.currentProjects && user.currentProjects.length > 0 ? user.currentProjects : [];
  const mainProject = projects[0] || 'ключевое направление';
  const userGoals = user.yearlyGoals || {};

  const templates: Record<number, string[]> = {
    1: [
      `Определить стратегию развития для "${mainProject}" и цели "${userGoals.work || 'в работе'}"`,
      `Запустить первый этап проекта "${mainProject}"`,
      `Настроить систему дохода и внедрить "${userGoals.money || 'новые финансовые привычки'}"`,
      `Укрепить новый образ жизни и достичь "${userGoals.health || 'целей по здоровью'}"`
    ],
    2: [
      `Найти ключевого партнёра для "${mainProject}" и улучшить "${userGoals.family || 'отношения'}"`,
      `Отладить правила взаимодействия в команде проекта "${mainProject}"`,
      `Проработать эмоциональный интеллект для реализации "${userGoals.spirit || 'духовных целей'}"`,
      `Закрепить баланс между "${mainProject}" и личной жизнью`
    ],
    3: [
      `Масштабировать "${mainProject}" и достичь "${userGoals.work || 'профессионального роста'}"`,
      `Провести серию мероприятий для продвижения "${mainProject}"`,
      `Найти уникальный творческий стиль для "${userGoals.spirit || 'самовыражения'}"`,
      `Расширить круг влияния и реализовать "${userGoals.money || 'финансовый потенциал'}"`
    ],
    4: [
      `Выстроить жесткую структуру для "${mainProject}" и "${userGoals.work || 'рабочих процессов'}"`,
      `Создать системный "скелет" для реализации "${userGoals.money || 'финансовых целей'}"`,
      `Оптимизировать быт для поддержки "${userGoals.family || 'семейного благополучия'}"`,
      `Укрепить дисциплину в "${userGoals.health || 'заботе о теле'}" и проектах`
    ],
    5: [
      `Освоить новые рынки для "${mainProject}" и навыки для "${userGoals.work || 'карьеры'}"`,
      `Расширить географию контактов для реализации "${userGoals.money || 'финансовых планов'}"`,
      `Спланировать поездку, соответствующую "${userGoals.spirit || 'духовным поискам'}"`,
      `Экспериментировать с форматами в "${mainProject}" и "${userGoals.health || 'образе жизни'}"`
    ],
    6: [
      `Укрепить команду "${mainProject}" и "${userGoals.family || 'семейные узы'}"`,
      `Заняться эстетикой пространства для реализации "${userGoals.spirit || 'творческих идей'}"`,
      `Направить энергию в созидание и достижение "${userGoals.work || 'социальных целей'}"`,
      `Сбалансировать ценности "${userGoals.spirit || 'духа'}" с целями проекта`
    ],
    7: [
      `Провести глубокий аудит "${mainProject}" и "${userGoals.work || 'своих достижений'}"`,
      `Выстроить практику (Монро, Диспенза) для "${userGoals.spirit || 'внутреннего роста'}"`,
      `Понять истинные смыслы "${mainProject}" и "${userGoals.family || 'своих отношений'}"`,
      `Углубиться в аналитику для реализации "${userGoals.money || 'финансовой стратегии'}"`
    ],
    8: [
      `Реализовать "${mainProject}" и достичь "${userGoals.money || 'максимального дохода'}"`,
      `Пересобрать активы для реализации "${userGoals.work || 'амбициозных планов'}"`,
      `Взять на себя роль лидера в "${mainProject}" и "${userGoals.family || 'семье'}"`,
      `Управлять ресурсами для достижения "${userGoals.health || 'пиковой формы'}"`
    ],
    9: [
      `Завершить текущий цикл "${mainProject}" и "${userGoals.work || 'рабочих задач'}"`,
      `Провести ревизию для реализации "${userGoals.money || 'финансовой свободы'}"`,
      `Освободить пространство для "${userGoals.spirit || 'новых смыслов'}" и "${userGoals.family || 'семьи'}"`,
      `Подвести итоги и подготовить почву для "${userGoals.health || 'нового уровня жизни'}"`
    ]
  };

  return [1, 2, 3, 4].map(q => {
    const archetype = ARCHETYPES[personalYearNumber];
    const generalAdvice = `Квартал ${q} в году ${archetype.name}. Время для ${q === 1 ? 'планирования' : q === 2 ? 'развития' : q === 3 ? 'активности' : 'завершения'}.`;
    const specificAdvice = `Для вашей профессии (${user.profession || 'специалист'}) этот этап важен для реализации "${mainProject}". Учитывайте приоритеты: ${(user.focusAreas || []).join(', ')}.`;

    return {
      id: `q${q}-${yearTheme.id}`,
      userId: yearTheme.userId,
      year: yearTheme.year,
      quarter: q as 1 | 2 | 3 | 4,
      title: templates[personalYearNumber]?.[q - 1] || `Цель на ${q} квартал`,
      description: `### Общие рекомендации\n${generalAdvice}\n\n### Конкретные шаги\n${specificAdvice}`,
      relatedArea: AREAS[q % AREAS.length],
      parentYearThemeId: yearTheme.id,
    };
  });
}

export function generateMonthGoals(quarterObjectives: QuarterObjective[], user: User, personalYearNumber: number): MonthGoal[] {
  const projects = user.currentProjects && user.currentProjects.length > 0 ? user.currentProjects : [];
  const mainProject = projects[0] || 'проект';
  const userGoals = user.yearlyGoals || {};
  const archetype = ARCHETYPES[personalYearNumber];

  const templates: Record<number, Record<Area, string>> = {
    1: {
      work: `Запустить MVP "${mainProject}" (цель: ${userGoals.work || 'старт'})`,
      money: `Создать модель дохода (цель: ${userGoals.money || 'стабильность'})`,
      family: `Обсудить "${mainProject}" с семьей (цель: ${userGoals.family || 'поддержка'})`,
      spirit: `Медитация по Диспензе для манифестации "${userGoals.spirit || 'успеха'}"`,
      health: `Внедрить привычку для "${userGoals.health || 'энергии'}"`
    },
    2: {
      work: `Найти партнеров для "${mainProject}" (цель: ${userGoals.work || 'рост'})`,
      money: `Закрепить условия по "${userGoals.money || 'финансам'}"`,
      family: `Укрепить "${userGoals.family || 'отношения'}" через диалог`,
      spirit: `Практика осознанности для "${userGoals.spirit || 'спокойствия'}"`,
      health: `Наладить сон для "${userGoals.health || 'восстановления'}"`
    },
    3: {
      work: `Продвижение "${mainProject}" (цель: ${userGoals.work || 'публичность'})`,
      money: `Первые продажи в "${mainProject}" (цель: ${userGoals.money || 'прибыль'})`,
      family: `Творческий вечер (цель: ${userGoals.family || 'радость'})`,
      spirit: `Дневник для реализации "${userGoals.spirit || 'инсайтов'}"`,
      health: `Активность для "${userGoals.health || 'тонуса'}"`
    },
    4: {
      work: `Систематизация "${mainProject}" (цель: ${userGoals.work || 'порядок'})`,
      money: `Учет в "${userGoals.money || 'финансах'}"`,
      family: `Порядок в доме (цель: ${userGoals.family || 'уют'})`,
      spirit: `Дисциплина в медитациях для "${userGoals.spirit || 'воли'}"`,
      health: `Чек-ап для "${userGoals.health || 'долголетия'}"`
    },
    5: {
      work: `Тест расширения "${mainProject}" (цель: ${userGoals.work || 'новое'})`,
      money: `Инвестиции для "${userGoals.money || 'капитала'}"`,
      family: `Поездка (цель: ${userGoals.family || 'впечатления'})`,
      spirit: `Метод Монро для "${userGoals.spirit || 'расширения сознания'}"`,
      health: `Контроль стресса для "${userGoals.health || 'баланса'}"`
    },
    6: {
      work: `Сервис в "${mainProject}" (цель: ${userGoals.work || 'качество'})`,
      money: `Траты на "${userGoals.family || 'качество жизни'}"`,
      family: `Глубокий разговор (цель: ${userGoals.family || 'близость'})`,
      spirit: `Благодарность за "${userGoals.spirit || 'жизнь'}"`,
      health: `Питание для "${userGoals.health || 'легкости'}"`
    },
    7: {
      work: `Анализ "${mainProject}" (цель: ${userGoals.work || 'стратегия'})`,
      money: `Пассивный доход (цель: ${userGoals.money || 'свобода'})`,
      family: `Уединение (цель: ${userGoals.family || 'самопознание'})`,
      spirit: `Труды Диспензы о "${userGoals.spirit || 'силе мысли'}"`,
      health: `Детокс для "${userGoals.health || 'чистоты'}"`
    },
    8: {
      work: `Масштаб "${mainProject}" (цель: ${userGoals.work || 'лидерство'})`,
      money: `Крупная сделка (цель: ${userGoals.money || 'богатство'})`,
      family: `Семейная покупка (цель: ${userGoals.family || 'статус'})`,
      spirit: `Управление энергией для "${userGoals.spirit || 'влияния'}"`,
      health: `Тренировки для "${userGoals.health || 'силы'}"`
    },
    9: {
      work: `Завершение этапа "${mainProject}" (цель: ${userGoals.work || 'итог'})`,
      money: `Закрытие долгов (цель: ${userGoals.money || 'чистота'})`,
      family: `Обновление "${userGoals.family || 'отношений'}"`,
      spirit: `Рефлексия пути (цель: ${userGoals.spirit || 'мудрость'})`,
      health: `Отдых для "${userGoals.health || 'перезагрузки'}"`
    }
  };

  const goals: MonthGoal[] = [];
  quarterObjectives.forEach(q => {
    const startMonth = (q.quarter - 1) * 3 + 1;
    for (let i = 0; i < 3; i++) {
      const month = startMonth + i;
      const area = AREAS[month % AREAS.length];
      const generalAdvice = `Месяц ${month} в сфере ${AREA_LABELS[area]}. Энергия архетипа ${archetype.name} помогает в ${area === 'work' ? 'делах' : area === 'money' ? 'финансах' : area === 'family' ? 'отношениях' : area === 'spirit' ? 'духовности' : 'здоровье'}.`;
      const specificAdvice = `Как ${user.profession || 'специалист'}, используйте этот месяц для продвижения "${mainProject}". Ваши фокусы: ${(user.focusAreas || []).join(', ')}.`;

      goals.push({
        id: `m${month}-${q.id}`,
        userId: q.userId,
        year: q.year,
        month,
        title: templates[personalYearNumber]?.[area] || `Цель на месяц ${month}`,
        description: `### Общие рекомендации\n${generalAdvice}\n\n### Конкретные шаги\n${specificAdvice}`,
        relatedArea: area,
        parentQuarterObjectiveId: q.id,
        parentYearThemeId: q.parentYearThemeId,
      });
    }
  });
  return goals;
}

export function generateWeekFocuses(monthGoals: MonthGoal[], user: User): WeekFocus[] {
  const focuses: WeekFocus[] = [];
  monthGoals.forEach(m => {
    for (let i = 1; i <= 4; i++) {
      focuses.push({
        id: `w${i}-${m.id}`,
        userId: m.userId,
        year: m.year,
        month: m.month,
        weekNumber: (m.month - 1) * 4 + i,
        title: `Фокус недели ${i}: Детализация "${m.title}"`,
        description: `Концентрация на конкретном шаге: ${m.title}. Адаптируйте это под ваши проекты: ${(user.currentProjects || []).join(', ')}.`,
        relatedArea: m.relatedArea,
        parentMonthGoalId: m.id,
        parentQuarterObjectiveId: m.parentQuarterObjectiveId,
        parentYearThemeId: m.parentYearThemeId,
      });
    }
  });
  return focuses;
}

export function generateDailyTasks(weekFocuses: WeekFocus[], user: User, personalYearNumber: number): DailyStep[] {
  const projects = user.currentProjects && user.currentProjects.length > 0 ? user.currentProjects : [];
  const mainProject = projects[0] || 'проект';
  const userGoals = user.yearlyGoals || {};
  const archetype = ARCHETYPES[personalYearNumber];

  const templates: Record<number, Record<Area, string>> = {
    1: {
      work: `Шаг по "${mainProject}": ${userGoals.work || 'сделать важное действие'}`,
      money: `Финансы: ${userGoals.money || 'записать идею дохода'}`,
      family: `Семья: ${userGoals.family || 'уделить время близким'}`,
      spirit: userGoals.spirit ? `Практика для "${userGoals.spirit}": 5 мин визуализации по Диспензе` : '5 минут визуализации по Диспензе для реализации целей',
      health: `Здоровье: ${userGoals.health || 'сделать разминку'}`
    },
    2: {
      work: `Коммуникация по "${mainProject}": ${userGoals.work || 'обсудить задачу'}`,
      money: `Контроль: ${userGoals.money || 'сверить бюджет'}`,
      family: `Отношения: ${userGoals.family || '15 минут общения'}`,
      spirit: userGoals.spirit ? `Практика для "${userGoals.spirit}": "наблюдатель" за мыслями` : 'Практика "наблюдателя" за своими мыслями',
      health: `Режим: ${userGoals.health || 'лечь вовремя'}`
    },
    3: {
      work: `Креатив по "${mainProject}": ${userGoals.work || 'набросать идеи'}`,
      money: `Инструменты: ${userGoals.money || 'изучить стоимость'}`,
      family: `Дом: ${userGoals.family || 'совместный ужин'}`,
      spirit: userGoals.spirit ? `Фрирайтинг по цели "${userGoals.spirit}"` : 'Фрирайтинг: "Как я реализую свои цели?"',
      health: `Движение: ${userGoals.health || 'прогулка 30 мин'}`
    },
    4: {
      work: `Порядок в "${mainProject}": ${userGoals.work || 'структурировать данные'}`,
      money: `Учет: ${userGoals.money || 'внести данные в таблицу'}`,
      family: `Забота: ${userGoals.family || 'помочь близкому'}`,
      spirit: userGoals.spirit ? `Медитация на "${userGoals.spirit}" для ясности` : 'Медитация на концентрацию для ясности ума',
      health: `Питание: ${userGoals.health || 'полезный перекус'}`
    },
    5: {
      work: `Обучение для "${mainProject}": ${userGoals.work || 'изучить материал'}`,
      money: `Рынок: ${userGoals.money || 'анализ возможностей'}`,
      family: `Связь: ${userGoals.family || 'позвонить родным'}`,
      spirit: userGoals.spirit ? `Hemi-Sync (Монро) для цели "${userGoals.spirit}"` : 'Слушать аудио-практику Монро (Hemi-Sync)',
      health: `Энергия: ${userGoals.health || 'контрастный душ'}`
    },
    6: {
      work: `Благодарность в "${mainProject}": ${userGoals.work || 'написать партнеру'}`,
      money: `Уют: ${userGoals.money || 'купить полезное'}`,
      family: `Внимание: ${userGoals.family || 'сделать комплимент'}`,
      spirit: userGoals.spirit ? `Практика "Сердечный центр" (Диспенза) для "${userGoals.spirit}"` : 'Практика "Сердечный центр" по Диспензе',
      health: `Гибкость: ${userGoals.health || 'растяжка'}`
    },
    7: {
      work: `Анализ "${mainProject}": ${userGoals.work || 'итоги недели'}`,
      money: `Стратегия: ${userGoals.money || 'план на будущее'}`,
      family: `Тишина: ${userGoals.family || 'вечер чтения'}`,
      spirit: userGoals.spirit ? `Чтение Диспензы/Монро через призму "${userGoals.spirit}"` : '30 минут чтения Диспензы или Монро',
      health: `Релакс: ${userGoals.health || 'медитация на расслабление'}`
    },
    8: {
      work: `Решение по "${mainProject}": ${userGoals.work || 'важный выбор'}`,
      money: `Баланс: ${userGoals.money || 'проверить счета'}`,
      family: `Планы: ${userGoals.family || 'обсудить выходные'}`,
      spirit: userGoals.spirit ? `Утверждение воли для "${userGoals.spirit}"` : 'Практика утверждения своей воли и силы',
      health: `Тонус: ${userGoals.health || 'силовая тренировка'}`
    },
    9: {
      work: `Финиш по "${mainProject}": ${userGoals.work || 'закрыть задачу'}`,
      money: `Очистка: ${userGoals.money || 'отключить лишнее'}`,
      family: `Мир: ${userGoals.family || 'сказать спасибо'}`,
      spirit: userGoals.spirit ? `Рефлексия по цели "${userGoals.spirit}"` : 'Итоговая запись в дневнике за день',
      health: `Покой: ${userGoals.health || 'ранний сон'}`
    }
  };

  const steps: DailyStep[] = [];
  weekFocuses.forEach(w => {
    for (let i = 1; i <= 7; i++) {
      const date = new Date(w.year, 0, (w.weekNumber - 1) * 7 + i);
      const area = w.relatedArea;
      const generalAdvice = `День под энергией архетипа ${archetype.name}. Сфокусируйтесь на качестве действий.`;
      const specificAdvice = `Для вашей профессии (${user.profession || 'специалист'}) сегодня важно сделать шаг в проекте "${mainProject}".`;

      steps.push({
        id: `d${i}-${w.id}`,
        userId: w.userId,
        date: date.toISOString(),
        title: templates[personalYearNumber]?.[area] || `Задача дня ${i}`,
        description: `### Общие рекомендации\n${generalAdvice}\n\n### Конкретные шаги\n${specificAdvice}`,
        relatedArea: area,
        status: 'planned',
        parentWeekFocusId: w.id,
        parentMonthGoalId: w.parentMonthGoalId,
        parentQuarterObjectiveId: w.parentQuarterObjectiveId,
        parentYearThemeId: w.parentYearThemeId,
      });
    }
  });
  return steps;
}

// Progress Calculation Functions
export function getProgress(tasks: DailyStep[]): number {
  const relevantTasks = tasks.filter(t => t.status !== 'canceled');
  if (relevantTasks.length === 0) return 0;
  const doneTasks = relevantTasks.filter(t => t.status === 'done');
  return Math.round((doneTasks.length / relevantTasks.length) * 100);
}

export function getProgressForYear(tasks: DailyStep[]): number {
  return getProgress(tasks);
}

export function getProgressForQuarter(quarterId: string, tasks: DailyStep[]): number {
  return getProgress(tasks.filter(t => t.parentQuarterObjectiveId === quarterId));
}

export function getProgressForMonth(month: number, tasks: DailyStep[]): number {
  return getProgress(tasks.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month;
  }));
}

export function getProgressForWeek(month: number, weekNumber: number, tasks: DailyStep[]): number {
  return getProgress(tasks.filter(t => {
    const d = new Date(t.date);
    if (d.getMonth() + 1 !== month) return false;
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const w = Math.ceil((d.getDate() + startOfMonth.getDay()) / 7);
    return w === weekNumber;
  }));
}
