import React, { useState, useEffect } from 'react';
import { User, ArchetypeProfile, YearTheme, QuarterObjective, MonthGoal, WeekFocus, DailyStep, Area, ChatMessage } from './types';
import { AREAS, AREA_LABELS, ARCHETYPES } from './constants';
import { 
  generateArchetypeProfile, 
  generateYearTheme, 
  generateQuarterObjectives, 
  generateMonthGoals, 
  generateWeekFocuses, 
  generateDailyTasks, 
  getProgressForYear,
  getProgressForQuarter, 
  getProgressForMonth,
  getProgressForWeek
} from './utils';
import { getAssistantResponse } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Calendar, 
  Target, 
  CheckCircle2, 
  MessageSquare, 
  ChevronRight, 
  Briefcase, 
  Coins, 
  Heart, 
  Sparkles, 
  Activity,
  Send,
  Loader2,
  Menu,
  X
} from 'lucide-react';

import { baseTheme, brandAssets } from './theme';
import { archetypeStyles, ArchetypeStyle } from './archetypeStyles';

const AREA_ICONS: Record<Area, React.ReactNode> = {
  work: <Briefcase className="w-5 h-5" />,
  money: <Coins className="w-5 h-5" />,
  family: <Heart className="w-5 h-5" />,
  spirit: <Sparkles className="w-5 h-5" />,
  health: <Activity className="w-5 h-5" />,
};

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Гость (Демо)',
  birthDate: '1990-01-01',
  profession: 'Исследователь',
  familyStatus: 'single',
  hasChildren: false,
  interests: ['Саморазвитие', 'Творчество'],
  currentProjects: ['Изучение АрхиПути'],
  yearlyGoals: {},
  useArchetypeTheme: true,
  isDemo: true,
  externalChatHistory: ''
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<{
    archetypeProfile: ArchetypeProfile;
    yearTheme: YearTheme;
    quarterObjectives: QuarterObjective[];
    monthGoals: MonthGoal[];
    weekFocuses: WeekFocus[];
    dailySteps: DailyStep[];
  } | null>(null);

  const [screen, setScreen] = useState<'welcome' | 'onboarding' | 'year' | 'month' | 'today' | 'chat'>('welcome');
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempHistory, setTempHistory] = useState('');

  useEffect(() => {
    if (user) {
      setTempHistory(user.externalChatHistory || '');
    }
  }, [user]);

  const getTheme = () => {
    const defaultGradient = `linear-gradient(135deg, ${baseTheme.primary}, ${baseTheme.primaryDark})`;
    
    if (!user?.useArchetypeTheme || !data?.archetypeProfile) {
      return { 
        ...baseTheme, 
        archetype: null,
        accent: baseTheme.primary,
        gradient: defaultGradient
      };
    }
    
    const archetype = archetypeStyles[data.archetypeProfile.personalYearNumber];
    return {
      ...baseTheme,
      archetype,
      accent: archetype?.yearColor || baseTheme.primary,
      gradient: archetype?.yearGradient || defaultGradient
    };
  };

  const theme = getTheme();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('archi_user_id');
    if (savedUserId) {
      if (savedUserId === 'demo-user') {
        handleStartDemo();
      } else {
        fetchUser(savedUserId);
      }
    } else {
      // Automatically start demo if no user is found
      handleStartDemo();
    }
  }, []);

  const handleStartDemo = async () => {
    setLoading(true);
    setUser(DEMO_USER);
    localStorage.setItem('archi_user_id', 'demo-user');
    
    const year = new Date().getFullYear();
    const birthDate = new Date(DEMO_USER.birthDate);
    
    const archetypeProfile = generateArchetypeProfile(DEMO_USER.id, birthDate, year);
    const yearTheme = generateYearTheme(DEMO_USER, archetypeProfile);
    const quarterObjectives = generateQuarterObjectives(yearTheme, DEMO_USER, archetypeProfile.personalYearNumber);
    const monthGoals = generateMonthGoals(quarterObjectives, DEMO_USER, archetypeProfile.personalYearNumber);
    const weekFocuses = generateWeekFocuses(monthGoals, DEMO_USER);
    const dailySteps = generateDailyTasks(weekFocuses, DEMO_USER, archetypeProfile.personalYearNumber);

    const initData = {
      archetypeProfile,
      yearTheme,
      quarterObjectives,
      monthGoals,
      weekFocuses,
      dailySteps,
    };

    setData(initData);
    setScreen('today');
    setLoading(false);
  };

  const fetchUser = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`);
      const userData = await res.json();
      if (userData) {
        setUser(userData);
        fetchData(id);
      } else {
        // User not found in memory (server restart)
        localStorage.removeItem('archi_user_id');
        setScreen('welcome');
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem('archi_user_id');
      setScreen('welcome');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userId: string) => {
    try {
      const res = await fetch(`/api/data/${userId}`);
      const appData = await res.json();
      if (appData && appData.archetypeProfile) {
        setData(appData);
        setScreen('today');
      } else {
        localStorage.removeItem('archi_user_id');
        setUser(null);
        setScreen('welcome');
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem('archi_user_id');
      setUser(null);
      setScreen('welcome');
    }
  };

  const handleOnboarding = async (formData: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newUser = await res.json();
      setUser(newUser);
      localStorage.setItem('archi_user_id', newUser.id);

      const year = new Date().getFullYear();
      const birthDate = new Date(newUser.birthDate);
      
      const archetypeProfile = generateArchetypeProfile(newUser.id, birthDate, year);
      const yearTheme = generateYearTheme(newUser, archetypeProfile);
      const quarterObjectives = generateQuarterObjectives(yearTheme, newUser, archetypeProfile.personalYearNumber);
      const monthGoals = generateMonthGoals(quarterObjectives, newUser, archetypeProfile.personalYearNumber);
      const weekFocuses = generateWeekFocuses(monthGoals, newUser);
      const dailySteps = generateDailyTasks(weekFocuses, newUser, archetypeProfile.personalYearNumber);

      const initData = {
        archetypeProfile,
        yearTheme,
        quarterObjectives,
        monthGoals,
        weekFocuses,
        dailySteps,
      };

      await fetch('/api/data/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initData),
      });

      setData(initData);
      setScreen('year');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!data) return;
    const task = data.dailySteps.find(s => s.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'planned' : 'done';
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setData({
        ...data,
        dailySteps: data.dailySteps.map(s => s.id === taskId ? { ...s, status: newStatus } : s)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !data) return;

    const userMsg: ChatMessage = { role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const response = await getAssistantResponse(
      user,
      data.archetypeProfile,
      data.yearTheme,
      data.quarterObjectives,
      data.monthGoals,
      data.weekFocuses,
      data.dailySteps.filter(s => new Date(s.date).toDateString() === new Date().toDateString()),
      inputMessage
    );

    setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-colors duration-500" 
      style={{ backgroundColor: theme.background, color: theme.textPrimary }}
    >
      {screen !== 'onboarding' && (
        <nav className="fixed top-0 left-0 right-0 h-16 border-b z-50 flex items-center justify-between px-4 md:px-8 backdrop-blur-md"
          style={{ backgroundColor: `${theme.surface}CC`, borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: theme.accent || theme.primary, color: '#FFFFFF' }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-serif italic font-bold tracking-tight">АрхиПуть</h1>
            {user?.isDemo && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20">ДЕМО</span>
            )}
          </div>
          
          {data && (
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setScreen('today')} 
                className="text-sm font-medium transition-all relative py-1" 
                style={{ color: screen === 'today' ? theme.textPrimary : theme.textSecondary }}
              >
                Сегодня
                {screen === 'today' && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.accent || theme.primary }}
                  />
                )}
              </button>
              <button 
                onClick={() => setScreen('month')} 
                className="text-sm font-medium transition-all relative py-1" 
                style={{ color: screen === 'month' ? theme.textPrimary : theme.textSecondary }}
              >
                Месяц
                {screen === 'month' && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.accent || theme.primary }}
                  />
                )}
              </button>
              <button 
                onClick={() => setScreen('year')} 
                className="text-sm font-medium transition-all relative py-1" 
                style={{ color: screen === 'year' ? theme.textPrimary : theme.textSecondary }}
              >
                Год
                {screen === 'year' && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.accent || theme.primary }}
                  />
                )}
              </button>
              <button 
                onClick={() => setScreen('chat')} 
                className="text-sm font-medium transition-all relative py-1" 
                style={{ color: screen === 'chat' ? theme.textPrimary : theme.textSecondary }}
              >
                Ассистент
                {screen === 'chat' && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.accent || theme.primary }}
                  />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={async () => {
                if (!user) return;
                const updatedUser = { ...user, useArchetypeTheme: !user.useArchetypeTheme };
                setUser(updatedUser);
                try {
                  await fetch(`/api/user/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ useArchetypeTheme: updatedUser.useArchetypeTheme }),
                  });
                } catch (e) { console.error(e); }
              }}
              className="p-1.5 md:p-2 rounded-full transition-colors hover:bg-white/10 group relative"
              title="Переключить тему"
              style={{ color: user?.useArchetypeTheme ? (theme.accent || theme.primary) : theme.textSecondary }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-transform hover:scale-110 active:scale-95 shadow-sm overflow-hidden"
              style={{ backgroundColor: theme.accent || theme.primary, color: '#FFFFFF' }}
              title="Профиль и настройки"
            >
              {user ? user.name[0] : <UserIcon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </nav>
      )}

      {/* Bottom Navigation for Mobile */}
      {data && screen !== 'onboarding' && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 border-t z-50 flex items-center justify-around px-2 backdrop-blur-md safe-area-bottom"
          style={{ 
            backgroundColor: `${theme.surface}CC`, 
            borderColor: theme.border,
            height: 'calc(3.5rem + env(safe-area-inset-bottom))'
          }}
        >
          <button 
            onClick={() => setScreen('year')} 
            className="flex flex-col items-center gap-1 p-1 transition-all"
            style={{ color: screen === 'year' ? (theme.accent || theme.primary) : theme.textSecondary }}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Год</span>
          </button>
          <button 
            onClick={() => setScreen('month')} 
            className="flex flex-col items-center gap-1 p-1 transition-all"
            style={{ color: screen === 'month' ? (theme.accent || theme.primary) : theme.textSecondary }}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium">Месяц</span>
          </button>
          <button 
            onClick={() => setScreen('today')} 
            className="flex flex-col items-center gap-1 p-1 transition-all"
            style={{ color: screen === 'today' ? (theme.accent || theme.primary) : theme.textSecondary }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Сегодня</span>
          </button>
          <button 
            onClick={() => setScreen('chat')} 
            className="flex flex-col items-center gap-1 p-1 transition-all"
            style={{ color: screen === 'chat' ? (theme.accent || theme.primary) : theme.textSecondary }}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Чат</span>
          </button>
        </nav>
      )}

      {/* Right Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] z-[70] p-6 md:p-8 shadow-2xl flex flex-col"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary }}
            >
              <div className="flex justify-between items-center mb-6 md:mb-10">
                <h2 className="text-xl font-serif italic font-bold">Профиль</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 no-scrollbar">
                {/* Profile Info */}
                <div className="space-y-4">
                  {!user || user.isDemo ? (
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                      <div className="flex items-center gap-3 text-amber-500">
                        <UserIcon className="w-5 h-5" />
                        <h3 className="font-bold">Создайте профиль</h3>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed">
                        Вы находитесь в демо-режиме. Чтобы получить персональные расчеты и рекомендации, введите свои данные.
                      </p>
                      <button 
                        onClick={() => {
                          setIsSidebarOpen(false);
                          setScreen('onboarding');
                        }}
                        className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Заполнить данные
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-inner shrink-0"
                        style={{ backgroundColor: theme.accent || theme.primary, color: '#FFFFFF' }}
                      >
                        {user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">{user.name}</h3>
                        <p className="text-xs opacity-50">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : ''}</p>
                      </div>
                    </div>
                  )}

                  {data && (
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Архетип года</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10" style={{ color: theme.accent }}>
                          Год {data.archetypeProfile.personalYearNumber}
                        </span>
                      </div>
                      <p className="font-serif italic font-bold text-lg leading-tight">{theme.archetype?.name || data.archetypeProfile.personalYearArchetypeName}</p>
                    </div>
                  )}
                </div>

                {/* AI History Section */}
                {!user?.isDemo && (
                  <div className="space-y-4">
                    <div className="px-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">История общения с ИИ</h4>
                      <p className="text-[10px] opacity-60 mt-1 leading-relaxed">
                        Здесь вы можете сохранить фрагменты своих переписок с ИИ (например, с Perplexity). Ассистент АрхиПути будет использовать этот текст как дополнительный контекст при ответах.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <textarea 
                        className="w-full h-32 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none no-scrollbar"
                        placeholder="Вставьте текст переписки здесь..."
                        value={tempHistory}
                        onChange={(e) => setTempHistory(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            if (!user) return;
                            const updatedUser = { ...user, externalChatHistory: tempHistory };
                            setUser(updatedUser);
                            if (!user.isDemo) {
                              try {
                                await fetch(`/api/user/${user.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ externalChatHistory: tempHistory }),
                                });
                              } catch (e) { console.error(e); }
                            }
                          }}
                          className="flex-1 py-2 bg-stone-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-600 transition-colors"
                        >
                          Сохранить
                        </button>
                        <button 
                          onClick={() => setTempHistory('')}
                          className="px-4 py-2 bg-white/5 text-stone-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          Очистить
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Настройки</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 opacity-60" />
                        <span className="text-sm font-medium">Архетип-тема</span>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!user) return;
                          const updatedUser = { ...user, useArchetypeTheme: !user.useArchetypeTheme };
                          setUser(updatedUser);
                          if (!user.isDemo) {
                            try {
                              await fetch(`/api/user/${user.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ useArchetypeTheme: updatedUser.useArchetypeTheme }),
                              });
                            } catch (e) { console.error(e); }
                          }
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors ${user?.useArchetypeTheme ? 'bg-emerald-500' : 'bg-stone-600'}`}
                      >
                        <motion.div 
                          animate={{ x: user?.useArchetypeTheme ? 20 : 2 }}
                          className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {!user?.isDemo && (
                <div className="pt-6 mt-6 border-t border-white/10">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('archi_user_id');
                      window.location.reload();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <X className="w-4 h-4" /> Выйти из аккаунта
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className={`pt-14 md:pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 px-4 md:px-8 max-w-5xl mx-auto w-full flex flex-col ${screen === 'chat' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        <div className={`flex-1 flex flex-col ${screen === 'chat' ? 'overflow-hidden py-4' : 'py-8 md:py-12'}`}>
          {screen === 'onboarding' && <Onboarding onComplete={handleOnboarding} onBack={() => setScreen('today')} theme={theme} />}
          {screen === 'year' && data && <YearScreen data={data} theme={theme} user={user} />}
          {screen === 'month' && data && <MonthScreen data={data} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} onToggleTask={toggleTask} theme={theme} />}
          {screen === 'today' && data && <TodayScreen data={data} onToggleTask={toggleTask} onNavigateChat={() => setScreen('chat')} theme={theme} />}
          {screen === 'chat' && data && user && (
            <ChatScreen 
              messages={chatMessages} 
              onSend={handleSendMessage} 
              input={inputMessage} 
              setInput={setInputMessage} 
              loading={loading}
              theme={theme}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function WelcomeScreen({ onOpenProfile, onDemo, theme }: { onOpenProfile: () => void, onDemo: () => void, theme: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 md:space-y-12 max-w-2xl mx-auto"
    >
      <div className="space-y-4 md:space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-3xl mx-auto flex items-center justify-center shadow-xl"
          style={{ backgroundColor: theme.accent || theme.primary, color: '#FFFFFF' }}
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif italic font-bold tracking-tight">АрхиПуть</h1>
          <p className="text-xl md:text-2xl text-stone-500 leading-relaxed font-serif italic opacity-90">
            Ваш персональный навигатор по смыслам и ритмам жизни
          </p>
        </div>
        <div className="h-px w-24 bg-stone-200 mx-auto" />
        <p className="text-sm md:text-base text-stone-400 max-w-md mx-auto leading-relaxed">
          Система планирования, основанная на архетипических циклах. Помогает синхронизировать ваши цели с природными и личными ритмами.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 pt-4">
        <button 
          onClick={onDemo}
          className="w-full py-5 px-8 text-white rounded-2xl font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg"
          style={{ backgroundColor: theme.accent || theme.primary }}
        >
          <Sparkles className="w-6 h-6" /> Начать без данных
        </button>
        <button 
          onClick={onOpenProfile}
          className="w-full py-5 px-8 rounded-2xl font-bold border-2 transition-all hover:bg-white hover:scale-[1.02] active:scale-95 text-lg"
          style={{ borderColor: theme.border, color: theme.textPrimary }}
        >
          Ввести свои данные
        </button>
        <div className="flex items-center justify-center gap-6 pt-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">Циклы</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">Архетипы</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">Смыслы</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Onboarding({ onComplete, onBack, theme }: { onComplete: (data: any) => void, onBack: () => void, theme: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    profession: '',
    familyStatus: '',
    hasChildren: false,
    interests: [] as string[],
    currentProjects: '',
  });

  const interestsList = ['Саморазвитие', 'Карьера', 'Творчество', 'Спорт', 'Семья', 'Путешествия', 'Финансы', 'Духовность'];

  const next = () => setStep(s => s + 1);
  const back = () => {
    if (step === 1) onBack();
    else setStep(s => s - 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full py-10 px-6"
    >
      <div className="mb-10 space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all ${step >= i ? '' : 'opacity-20'}`} 
              style={{ backgroundColor: step >= i ? (theme.accent || theme.primary) : theme.textSecondary }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-serif italic font-bold">
          {step === 1 && "Давайте познакомимся"}
          {step === 2 && "Ваш контекст"}
          {step === 3 && "Ваши приоритеты"}
        </h2>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Как вас зовут?</label>
              <input 
                type="text" 
                autoFocus
                className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ваше имя"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Дата вашего рождения</label>
              <input 
                type="date" 
                className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div className="pt-6 flex flex-col gap-3">
              <button 
                disabled={!formData.name || !formData.birthDate}
                onClick={next}
                className="w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: theme.accent || theme.primary }}
              >
                Продолжить
              </button>
              <button 
                onClick={back}
                className="w-full py-3 text-stone-400 font-bold text-xs uppercase tracking-widest"
              >
                Назад
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Чем вы занимаетесь?</label>
              <input 
                type="text" 
                autoFocus
                className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
                value={formData.profession}
                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                placeholder="Ваша профессия"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Семейное положение</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'single', label: 'Холост / Не замужем' },
                  { id: 'married', label: 'В браке' },
                  { id: 'partnership', label: 'В отношениях' }
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => setFormData({ ...formData, familyStatus: status.id })}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      formData.familyStatus === status.id ? 'text-white' : 'opacity-60'
                    }`}
                    style={{ 
                      backgroundColor: formData.familyStatus === status.id ? (theme.accent || theme.primary) : 'transparent',
                      borderColor: formData.familyStatus === status.id ? (theme.accent || theme.primary) : theme.border
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setFormData({ ...formData, hasChildren: !formData.hasChildren })}
              className="flex items-center gap-3 p-4 rounded-2xl border-2 w-full transition-all"
              style={{ borderColor: theme.border }}
            >
              <div 
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  formData.hasChildren ? 'text-white' : 'opacity-20'
                }`}
                style={{ 
                  backgroundColor: formData.hasChildren ? (theme.accent || theme.primary) : 'transparent',
                  borderColor: formData.hasChildren ? (theme.accent || theme.primary) : theme.border
                }}
              >
                {formData.hasChildren && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className="font-bold text-sm">У меня есть дети</span>
            </button>
            <div className="pt-6 flex flex-col gap-3">
              <button 
                onClick={next}
                className="w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: theme.accent || theme.primary }}
              >
                Далее
              </button>
              <button 
                onClick={back}
                className="w-full py-3 text-stone-400 font-bold text-xs uppercase tracking-widest"
              >
                Назад
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Что в фокусе?</label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map(interest => (
                  <button
                    key={interest}
                    onClick={() => {
                      const next = formData.interests.includes(interest)
                        ? formData.interests.filter(i => i !== interest)
                        : [...formData.interests, interest];
                      setFormData({ ...formData, interests: next });
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'text-white'
                        : 'opacity-60'
                    }`}
                    style={{ 
                      backgroundColor: formData.interests.includes(interest) ? (theme.accent || theme.primary) : 'transparent',
                      borderColor: formData.interests.includes(interest) ? (theme.accent || theme.primary) : theme.border
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Текущие проекты и задачи</label>
              <textarea 
                className="w-full p-4 rounded-2xl border-2 focus:outline-none transition-all h-32 resize-none"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
                value={formData.currentProjects}
                onChange={e => setFormData({ ...formData, currentProjects: e.target.value })}
                placeholder="Например: запуск нового проекта, ремонт, обучение..."
              />
            </div>
            <div className="pt-6 flex flex-col gap-3">
              <button 
                onClick={() => onComplete({ ...formData, currentProjects: [formData.currentProjects], useArchetypeTheme: true })} 
                className="w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: theme.accent || theme.primary }}
              >
                Рассчитать мой путь
              </button>
              <button 
                onClick={back}
                className="w-full py-3 text-stone-400 font-bold text-xs uppercase tracking-widest"
              >
                Назад
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function YearScreen({ data, theme, user }: { data: any, theme: any, user: User | null }) {
  const { archetypeProfile, yearTheme, quarterObjectives, dailySteps } = data;
  const yearProgress = getProgressForYear(dailySteps);
  const archetype = theme.archetype;
  const [isCrystalModalOpen, setIsCrystalModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <header className="text-center space-y-6 relative pt-8">
        {archetype && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: user?.useArchetypeTheme ? 0.05 : 0.02, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          >
            <svg width="600" height="600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={archetype.svgPath} fill={theme.accent} />
            </svg>
          </motion.div>
        )}

        <div className="relative z-10 space-y-6">
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setIsCrystalModalOpen(true)}
            className="inline-flex items-center justify-center w-32 h-32 rounded-3xl text-5xl font-serif mb-4 shadow-xl transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
            style={{ background: theme.gradient, color: '#FFFFFF' }}
          >
            <span className="relative z-10">{archetypeProfile.personalYearNumber}</span>
          </motion.button>
          
          <div className="space-y-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Ваш Архетип Года</p>
              <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">
                {archetype?.name || archetypeProfile.personalYearArchetypeName}
              </h2>
            </motion.div>
          </div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-base md:text-lg leading-relaxed opacity-70 font-serif italic"
          >
            "{archetype?.descriptionShort || archetypeProfile.personalYearDescription}"
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8"
          >
            <button 
              onClick={() => setIsCrystalModalOpen(true)}
              className="group p-6 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.98] relative overflow-hidden" 
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 opacity-40" style={{ color: theme.accent }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Кристалл года</span>
                </div>
                <h4 className="font-bold text-xl mb-1">{archetype?.crystalName}</h4>
                <p className="text-xs opacity-60 leading-relaxed">{archetype?.crystalDescription}</p>
              </div>
            </button>

            <div className="p-6 rounded-2xl border text-left flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 opacity-40" style={{ color: theme.accent }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Символ и Путь</span>
                </div>
                <p className="text-sm opacity-80 leading-relaxed italic">{archetype?.iconHint}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-md mx-auto pt-10"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">
              <span>Прогресс года</span>
              <span>{yearProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-stone-200/20" style={{ backgroundColor: `${theme.border}30` }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${yearProgress}%` }}
                className="h-full rounded-full"
                style={{ background: theme.gradient }}
              />
            </div>
          </motion.div>
        </div>
      </header>

      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="p-8 md:p-10 rounded-3xl border shadow-sm relative overflow-hidden" 
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
              Главная тема
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold">{yearTheme.title}</h3>
            <p className="text-base opacity-70 leading-relaxed">{yearTheme.description}</p>
          </div>
          <div className="w-full md:w-px h-px md:h-32 bg-stone-200/20" style={{ backgroundColor: theme.border }} />
          <div className="flex flex-col gap-2 text-center md:text-left min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ваш девиз</span>
            <p className="text-xl font-serif italic" style={{ color: theme.accent }}>«Действуй из состояния потока»</p>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AREAS.map((area, idx) => (
          <motion.div 
            key={area} 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all group relative overflow-hidden" 
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: theme.background, color: theme.accent || theme.primary }}>
                  {AREA_ICONS[area]}
                </div>
                <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-40">{AREA_LABELS[area]}</h3>
              </div>
              <p className="text-sm leading-relaxed opacity-80">{archetypeProfile.themesByArea[area]}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Стратегия</span>
            <h3 className="text-3xl font-serif font-bold">Квартальные цели</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quarterObjectives.map((q: QuarterObjective, idx: number) => (
            <motion.div 
              key={q.id} 
              initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl border flex items-center justify-between group hover:shadow-md transition-all" 
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{q.quarter} Квартал</span>
                  <div className="w-1 h-1 rounded-full bg-stone-300" />
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{AREA_LABELS[q.relatedArea]}</p>
                </div>
                <h4 className="text-lg font-bold group-hover:text-accent transition-colors">{q.title}</h4>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div 
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-bold relative"
                  style={{ borderColor: `${theme.accent}20` }}
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      stroke={theme.accent}
                      strokeWidth="2"
                      strokeDasharray={`${getProgressForQuarter(q.id, data.dailySteps)}, 100`}
                    />
                  </svg>
                  {getProgressForQuarter(q.id, data.dailySteps)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Crystal Modal */}
      <AnimatePresence>
        {isCrystalModalOpen && archetype && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCrystalModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-[110] p-8 rounded-3xl shadow-2xl overflow-hidden border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Архетип года</span>
                    <h3 className="text-3xl font-serif font-bold">{archetype.name}</h3>
                  </div>
                  <button 
                    onClick={() => setIsCrystalModalOpen(false)}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <X className="w-6 h-6 opacity-40" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-stone-500/5 border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 rounded-xl bg-white/5">
                        <Sparkles className="w-6 h-6" style={{ color: theme.accent }} />
                      </div>
                      <h4 className="font-bold text-xl">{archetype.crystalName}</h4>
                    </div>
                    <p className="text-sm opacity-70 leading-relaxed">{archetype.crystalDescription}</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-500/5 border border-white/5">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Суть года</h5>
                    <p className="text-lg italic font-serif opacity-80">"{archetype.descriptionShort}"</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsCrystalModalOpen(false)}
                  className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
                  style={{ backgroundColor: theme.accent || theme.primary }}
                >
                  Принять энергию года
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MonthScreen({ data, selectedMonth, onMonthChange, onToggleTask, theme }: { data: any, selectedMonth: number, onMonthChange: (m: number) => void, onToggleTask: (id: string) => void, theme: any }) {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthGoals = data.monthGoals.filter((g: MonthGoal) => g.month === selectedMonth);
  const monthTasks = data.dailySteps.filter((s: DailyStep) => new Date(s.date).getMonth() + 1 === selectedMonth);
  
  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-0.5 bg-current opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Месячный цикл {selectedMonth}/12</p>
            </div>
            <h2 className="text-6xl md:text-7xl font-serif font-bold tracking-tight">{months[selectedMonth - 1]}</h2>
          </div>
          
          <div className="flex items-center gap-6 p-6 rounded-3xl border bg-white/5 shadow-lg" style={{ borderColor: theme.border }}>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Прогресс месяца</p>
              <p className="text-2xl font-serif font-bold">{getProgressForMonth(selectedMonth, data.dailySteps)}%</p>
            </div>
            <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center relative" style={{ borderColor: `${theme.accent}15` }}>
              <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="3"
                  strokeDasharray={`${getProgressForMonth(selectedMonth, data.dailySteps)}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <Target className="w-6 h-6 opacity-20" style={{ color: theme.accent }} />
            </div>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4">
          {months.map((m, i) => {
            const mProgress = getProgressForMonth(i + 1, data.dailySteps);
            const isActive = selectedMonth === i + 1;
            return (
              <button
                key={m}
                onClick={() => onMonthChange(i + 1)}
                className={`group relative px-6 py-4 rounded-2xl transition-all flex flex-col items-start gap-2 border min-w-[140px] ${
                  isActive ? 'scale-105 z-10 shadow-xl' : 'opacity-40 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: isActive ? (theme.accent || theme.primary) : theme.surface,
                  borderColor: isActive ? (theme.accent || theme.primary) : theme.border,
                  color: isActive ? '#FFFFFF' : theme.textPrimary
                }}
              >
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'opacity-40'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-lg font-serif font-bold">{m}</span>
                <div className="w-full h-1 rounded-full bg-black/5 mt-1 overflow-hidden">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${mProgress}%`, 
                      backgroundColor: isActive ? '#FFFFFF' : theme.accent,
                      opacity: isActive ? 0.4 : 1
                    }} 
                  />
                </div>
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${theme.border}40` }}>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold">Векторы</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Цели месяца</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {monthGoals.map((g: MonthGoal, idx: number) => (
              <motion.div 
                key={g.id} 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-3xl border relative overflow-hidden group hover:shadow-md transition-all" 
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-stone-500/5" style={{ color: theme.accent || theme.primary }}>
                      {AREA_ICONS[g.relatedArea]}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{AREA_LABELS[g.relatedArea]}</span>
                  </div>
                  <h4 className="text-xl font-bold leading-tight group-hover:text-accent transition-colors">{g.title}</h4>
                  <p className="text-sm opacity-60 leading-relaxed italic">{g.description}</p>
                </div>
              </motion.div>
            ))}
            {monthGoals.length === 0 && (
              <div className="text-center py-16 opacity-20 italic font-serif text-xl">Векторы еще не заданы</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${theme.border}40` }}>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold">Практики</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Ежедневные шаги</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {monthTasks.slice(0, 20).map((s: DailyStep, idx: number) => (
              <motion.div 
                key={s.id} 
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-5 rounded-2xl border group hover:shadow-sm transition-all" 
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <button 
                  onClick={() => onToggleTask(s.id)}
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    s.status === 'done' ? 'scale-90' : 'hover:scale-110'
                  }`}
                  style={{ 
                    backgroundColor: s.status === 'done' ? (theme.accent || theme.primary) : 'transparent',
                    borderColor: s.status === 'done' ? (theme.accent || theme.primary) : theme.border,
                    color: '#FFFFFF'
                  }}
                >
                  {s.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold truncate ${s.status === 'done' ? 'opacity-30 line-through' : ''}`}>{s.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{new Date(s.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                    <div className="w-1 h-1 rounded-full bg-stone-500/10" />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{AREA_LABELS[s.relatedArea]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {monthTasks.length === 0 && (
              <div className="col-span-full text-center py-16 opacity-20 italic font-serif text-xl">Список практик пуст</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodayScreen({ data, onToggleTask, onNavigateChat, theme }: { data: any, onToggleTask: (id: string) => void, onNavigateChat: () => void, theme: any }) {
  const today = new Date();
  const todayTasks = data.dailySteps.filter((s: DailyStep) => {
    const d = new Date(s.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const currentMonth = today.getMonth() + 1;
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekNumber = Math.ceil((today.getDate() + startOfMonth.getDay()) / 7);
  const currentWeekFocus = data.weekFocuses.find((f: WeekFocus) => f.month === currentMonth && f.weekNumber === weekNumber);
  const currentMonthGoal = data.monthGoals.find((g: MonthGoal) => g.month === currentMonth);

  const doneCount = todayTasks.filter((t: DailyStep) => t.status === 'done').length;
  const progress = todayTasks.length > 0 ? Math.round((doneCount / todayTasks.length) * 100) : 0;
  const weekProgress = getProgressForWeek(currentMonth, weekNumber, data.dailySteps);

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-0.5 bg-current opacity-20"
            />
            <motion.p 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-widest opacity-40"
            >
              {today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </motion.p>
          </div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-7xl font-serif font-bold tracking-tight"
          >
            Сегодня
          </motion.h2>
        </div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-lg border backdrop-blur-sm"
          style={{ backgroundColor: `${theme.accent}10`, color: theme.accent || theme.primary, borderColor: `${theme.accent}20` }}
        >
          <Sparkles className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="opacity-50 text-[9px] uppercase tracking-widest">Энергия дня</span>
            <span className="text-base font-serif italic">{theme.archetype?.name || data.archetypeProfile.personalYearArchetypeName}</span>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMonthGoal && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-3xl border relative overflow-hidden group hover:shadow-md transition-all" 
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 opacity-40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Вектор месяца</span>
                  </div>
                  <h4 className="text-xl font-bold leading-tight group-hover:text-accent transition-colors">{currentMonthGoal.title}</h4>
                </div>
              </motion.div>
            )}

            {currentWeekFocus && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-8 rounded-3xl border relative overflow-hidden group hover:shadow-md transition-all" 
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-40" />
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Фокус недели</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-stone-500/5 text-[9px] font-bold opacity-60">
                      {weekProgress}%
                    </div>
                  </div>
                  <h4 className="text-xl font-serif font-bold leading-tight group-hover:text-accent transition-colors">{currentWeekFocus.title}</h4>
                </div>
              </motion.div>
            )}
          </div>

          <section className="space-y-6">
            <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: `${theme.border}40` }}>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold">Практики дня</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{doneCount}/{todayTasks.length}</span>
                <div className="w-20 h-1 rounded-full bg-stone-500/10 overflow-hidden">
                  <div className="h-full" style={{ width: `${progress}%`, backgroundColor: theme.accent }} />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {todayTasks.map((t: DailyStep, idx: number) => (
                <motion.div 
                  key={t.id} 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="flex items-center gap-6 p-6 rounded-2xl group transition-all hover:shadow-md border relative overflow-hidden"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <button 
                    onClick={() => onToggleTask(t.id)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all relative z-10 ${
                      t.status === 'done' ? 'scale-90' : 'hover:scale-110'
                    }`}
                    style={{ 
                      backgroundColor: t.status === 'done' ? (theme.accent || theme.primary) : 'transparent',
                      borderColor: t.status === 'done' ? (theme.accent || theme.primary) : theme.border,
                      color: '#FFFFFF'
                    }}
                  >
                    {t.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{AREA_LABELS[t.relatedArea]}</span>
                    </div>
                    <p className={`text-lg font-bold leading-tight ${t.status === 'done' ? 'opacity-20 line-through' : ''}`}>{t.title}</p>
                  </div>
                </motion.div>
              ))}
              {todayTasks.length === 0 && (
                <div className="text-center py-16 opacity-30 italic font-serif text-xl">На сегодня задач нет. Время для созерцания.</div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-8 rounded-3xl shadow-xl relative overflow-hidden text-white" 
            style={{ background: theme.gradient || theme.accent || theme.primary }}
          >
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-lg">Ритм дня</h3>
              </div>
              
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${progress}, 100` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-serif font-bold">{progress}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Готово</span>
                </div>
              </div>

              <button 
                onClick={onNavigateChat}
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center gap-3 transition-all group/btn"
              >
                <MessageSquare className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-bold">Спросить ИИ</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChatScreen({ messages, onSend, input, setInput, loading, theme }: { messages: ChatMessage[], onSend: () => void, input: string, setInput: (s: string) => void, loading: boolean, theme: any }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col rounded-3xl border shadow-sm overflow-hidden h-full" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <header className="p-3 md:p-4 border-b flex items-center gap-3 shrink-0" style={{ borderColor: theme.border }}>
        <div 
          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: theme.accent || theme.primary }}
        >
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm md:text-base">ИИ-Ассистент АрхиПуть</h3>
          <p className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Онлайн</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8 md:py-12 opacity-40 space-y-4">
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-20" />
            <p className="max-w-xs mx-auto text-xs md:text-sm">Здравствуйте! Я ваш персональный ассистент. Могу помочь адаптировать план под ваш архетип или ответить на вопросы по целям.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                m.role === 'user' ? 'text-white rounded-tr-none' : 'text-stone-800 rounded-tl-none'
              }`}
              style={{ 
                backgroundColor: m.role === 'user' ? (theme.accent || theme.primary) : theme.background,
                color: m.role === 'user' ? '#FFFFFF' : theme.textPrimary
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 md:p-4 rounded-2xl rounded-tl-none" style={{ backgroundColor: theme.background }}>
              <Loader2 className="w-4 h-4 animate-spin opacity-40" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 border-t shrink-0" style={{ borderColor: theme.border }}>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-2.5 md:p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/5 text-xs md:text-sm"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }}
            placeholder="Задайте вопрос..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
          />
          <button 
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="p-2.5 md:p-3 text-white rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent || theme.primary }}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
