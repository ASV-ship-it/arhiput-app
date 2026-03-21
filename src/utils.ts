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
  const personalYearNumber = calculatePersonalYear(birthDate, year);
  const archetype = ARCHETYPES[personalYearNumber];

  return {
    userId,
    year,
    personalYearNumber,
    personalYearArchetypeName: archetype.name,
    personalYearDescription: archetype.description,
    themesByArea: archetype.themes,
  };
}

export function generateYearTheme(user: User, archetypeProfile: ArchetypeProfile): YearTheme {
  const archetype = ARCHETYPES[archetypeProfile.personalYearNumber];
  return {
    id: `year-${archetypeProfile.year}-${user.id}`,
    userId: user.id,
    year: archetypeProfile.year,
    title: `Год под знаком архетипа ${archetype.name}`,
    description: archetype.description,
    areaThemes: archetype.themes,
  };
}

export function generateQuarterObjectives(yearTheme: YearTheme, user: User, personalYearNumber: number): QuarterObjective[] {
  const templates: Record<number, string[]> = {
    1: [
      'Определить 1–2 ключевых направления на 9 лет',
      'Запустить первый продукт/курс/проект',
      'Настроить систему дохода и привычек',
      'Укрепить новый образ жизни и работы'
    ],
    2: [
      'Найти или укрепить ключевого партнёра',
      'Отладить правила в отношениях и финансах',
      'Проработать эмоциональные реакции',
      'Закрепить баланс и сотрудничество'
    ],
    3: [
      'Запустить или оживить творческий проект',
      'Выступить публично или провести вебинар',
      'Найти комфортный формат самовыражения',
      'Расширить круг общения и идей'
    ],
    4: [
      'Выстроить устойчивый распорядок дня',
      'Создать "скелет" проекта или бизнеса',
      'Сформировать финансовую подушку',
      'Укрепить фундамент и дисциплину'
    ],
    5: [
      'Освоить новое направление или навык',
      'Расширить круг общения и возможностей',
      'Спланировать и совершить поездку',
      'Экспериментировать с форматами жизни'
    ],
    6: [
      'Укрепить или пересобрать отношения',
      'Заняться благоустройством дома',
      'Направить энергию в созидание',
      'Сбалансировать ценности и желания'
    ],
    7: [
      'Пройти значимое обучение или курс',
      'Выстроить личную духовную практику',
      'Понять свои истинные цели и смыслы',
      'Углубиться в исследования и анализ'
    ],
    8: [
      'Реализовать проект с видимым результатом',
      'Пересобрать финансовую стратегию',
      'Взять ответственность за крупный вопрос',
      'Собирать плоды и управлять ресурсами'
    ],
    9: [
      'Закрыть старые проекты',
      'Разобраться с финансами и долгами',
      'Привести в порядок дом, цифровое пространство, документы',
      'Подвести итоги 9-летия и спланировать новый цикл'
    ]
  };

  return [1, 2, 3, 4].map(q => ({
    id: `q${q}-${yearTheme.id}`,
    userId: yearTheme.userId,
    year: yearTheme.year,
    quarter: q as 1 | 2 | 3 | 4,
    title: templates[personalYearNumber]?.[q - 1] || `Цель на ${q} квартал`,
    description: `Фокус на реализации потенциала года ${yearTheme.year} в сфере ${AREAS[q % AREAS.length]}`,
    relatedArea: AREAS[q % AREAS.length],
    parentYearThemeId: yearTheme.id,
  }));
}

export function generateMonthGoals(quarterObjectives: QuarterObjective[], user: User, personalYearNumber: number): MonthGoal[] {
  const templates: Record<number, Record<Area, string>> = {
    1: {
      work: 'Запустить beta-версию курса/приложения',
      money: 'Сформировать базовый финансовый план на 3 года',
      family: 'Утвердить совместные цели и новый распорядок',
      spirit: 'Определить главные практики и встроить их в неделю',
      health: 'Запустить новую физическую рутину'
    },
    2: {
      work: 'Найти напарника или запустить совместный проект',
      money: 'Зафиксировать финансовые договорённости',
      family: 'Укрепить союз через совместное планирование',
      spirit: 'Практика эмпатии и активного слушания',
      health: 'Наладить режим сна и эмоциональный покой'
    },
    3: {
      work: 'Подготовить презентацию или новый контент',
      money: 'Найти способ монетизации творчества',
      family: 'Организовать яркое семейное событие',
      spirit: 'Начать вести творческий дневник',
      health: 'Добавить радости в движение (танцы, игры)'
    },
    4: {
      work: 'Описать ключевые процессы и регламенты',
      money: 'Навести порядок в бюджете и накоплениях',
      family: 'Обустроить быт и домашнюю рутину',
      spirit: 'Соблюдать график духовных практик',
      health: 'Профилактика и чекап здоровья'
    },
    5: {
      work: 'Попробовать новый формат работы или нишу',
      money: 'Протестировать новый источник дохода',
      family: 'Запланировать семейное путешествие',
      spirit: 'Изучить новую философию или культуру',
      health: 'Следить за уровнем энергии, избегать выгорания'
    },
    6: {
      work: 'Проект, связанный с людьми или сервисом',
      money: 'Инвестиции в уют и комфорт близких',
      family: 'Уделить время качеству отношений в паре',
      spirit: 'Переоценка личных ценностей',
      health: 'Баланс между удовольствием и дисциплиной'
    },
    7: {
      work: 'Глубокое исследование или аналитика',
      money: 'Долгосрочное финансовое планирование',
      family: 'Честный разговор о смыслах и будущем',
      spirit: 'Ретрит или глубокое погружение в обучение',
      health: 'Внимание к ментальному здоровью'
    },
    8: {
      work: 'Масштабирование текущего проекта',
      money: 'Крупная сделка или финансовый результат',
      family: 'Решение имущественных или жилищных вопросов',
      spirit: 'Работа с темой личной силы и границ',
      health: 'Поддержание ресурса при высоких нагрузках'
    },
    9: {
      work: 'Закрыть один крупный проект / модуль',
      money: 'Составить список всех долгов и план погашения',
      family: 'Поговорить с партнёром о планах на 3–5 лет',
      spirit: 'Закончить один курс/книгу по психологии/духовности',
      health: 'Провести полное обследование организма'
    }
  };

  const goals: MonthGoal[] = [];
  quarterObjectives.forEach(q => {
    const startMonth = (q.quarter - 1) * 3 + 1;
    for (let i = 0; i < 3; i++) {
      const month = startMonth + i;
      const area = AREAS[month % AREAS.length];
      goals.push({
        id: `m${month}-${q.id}`,
        userId: q.userId,
        year: q.year,
        month,
        title: templates[personalYearNumber]?.[area] || `Цель на месяц ${month}`,
        description: `Шаг к цели квартала: ${q.title}`,
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
        title: `Фокус недели ${i}`,
        description: `Концентрация на задаче месяца: ${m.title}`,
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
  const templates: Record<number, Record<Area, string>> = {
    1: {
      work: 'Сделать один шаг к запуску (написать письмо, блок урока, фичу)',
      money: 'Проработать одну идею дополнительного дохода или отложить небольшую сумму',
      family: 'Обсудить с близкими новые правила или планы',
      spirit: '5–10 минут настройки: чего я хочу от нового цикла?',
      health: 'Выполнить новую физическую рутину'
    },
    2: {
      work: 'Обсудить детали совместного дела с партнером',
      money: 'Сверить расходы с общим планом',
      family: 'Провести вечер, внимательно слушая близкого',
      spirit: 'Практика эмпатии в общении',
      health: 'Медитация на эмоциональное равновесие'
    },
    3: {
      work: 'Написать пост или создать черновик идеи',
      money: 'Сделать шаг в творческом заработке',
      family: 'Придумать веселое занятие для всех',
      spirit: '10 минут свободного письма (фрирайтинг)',
      health: 'Активная прогулка в удовольствие'
    },
    4: {
      work: 'Привести в порядок один рабочий процесс',
      money: 'Записать все траты за день',
      family: 'Сделать что-то полезное для дома',
      spirit: 'Выполнить привычную практику без пропусков',
      health: 'Соблюсти режим питания и сна'
    },
    5: {
      work: 'Узнать что-то новое о своей сфере',
      money: 'Изучить возможность расширения дохода',
      family: 'Предложить идею для мини-поездки',
      spirit: 'Почитать книгу о новом взгляде на мир',
      health: 'Сменить обстановку для подзарядки'
    },
    6: {
      work: 'Помочь коллеге или клиенту делом',
      money: 'Купить что-то красивое для дома',
      family: 'Сделать приятный сюрприз партнеру',
      spirit: 'Подумать, что для меня сейчас важнее всего',
      health: 'Приготовить здоровую и вкусную еду'
    },
    7: {
      work: 'Погрузиться в изучение сложной темы',
      money: 'Проанализировать свои финансовые привычки',
      family: 'Побыть в тишине, осознать свои чувства',
      spirit: '30 минут чтения глубокой литературы',
      health: 'Ранний отход ко сну, покой'
    },
    8: {
      work: 'Принять волевое решение по проекту',
      money: 'Проверить состояние счетов и активов',
      family: 'Обсудить важную семейную покупку',
      spirit: 'Практика уверенности и границ',
      health: 'Силовая тренировка или активный отдых'
    },
    9: {
      work: 'Выбери одно незавершённое дело и сделай шаг, который его продвигает',
      money: 'Пересмотри одну трату/подписку',
      family: '5–10 минут спокойно обсудить с близкими планы/чувства',
      spirit: '10–15 минут дневника: что сегодня хочется завершить?',
      health: 'Легкая прогулка или растяжка'
    }
  };

  const steps: DailyStep[] = [];
  weekFocuses.forEach(w => {
    for (let i = 1; i <= 7; i++) {
      const date = new Date(w.year, 0, (w.weekNumber - 1) * 7 + i);
      const area = w.relatedArea;
      steps.push({
        id: `d${i}-${w.id}`,
        userId: w.userId,
        date: date.toISOString(),
        title: templates[personalYearNumber]?.[area] || `Задача дня ${i}`,
        description: `Маленький шаг в сфере ${AREA_LABELS[area]}`,
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
