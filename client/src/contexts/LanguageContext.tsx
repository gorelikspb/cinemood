import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  // Navigation
  dashboard: string;
  movieDiary: string;
  addMovie: string;
  statistics: string;
  
  // Dashboard
  welcomeBack: string;
  movieJourney: string;
  moviesWatched: string;
  averageRating: string;
  emotionsTracked: string;
  watchDays: string;
  moviesWatchedThisYear: string;
  emotionDistribution: string;
  recentMovies: string;
  viewAll: string;
  noMoviesLogged: string;
  addFirstMovie: string;
  statisticsUnlockAt: string;
  
  // Movie Diary
  personalCollection: string;
  searchMovies: string;
  dateWatched: string;
  title: string;
  rating: string;
  dateAdded: string;
  newestFirst: string;
  oldestFirst: string;
  noMoviesFound: string;
  tryAdjustingSearch: string;
  startBuildingDiary: string;
  
  // Add Movie
  logMovie: string;
  trackEmotions: string;
  searchForMovie: string;
  enterMovieTitle: string;
  selectedMovie: string;
  watchDetails: string;
  dateWatchedLabel: string;
  yourRating: string;
  outOfTen: string;
  notes: string;
  shareThoughts: string;
  emotions: string;
  addNewEmotion: string;
  emotionType: string;
  selectEmotion: string;
  intensity: string;
  description: string;
  whyFeelThisWay: string;
  addEmotion: string;
  addedEmotions: string;
  addMovieToDiary: string;
  addingMovie: string;
  
  // Movie Details
  movieInformation: string;
  releaseDate: string;
  runtime: string;
  genres: string;
  tmdbRating: string;
  overview: string;
  yourNotes: string;
  noOverview: string;
  noNotes: string;
  edit: string;
  cancel: string;
  saveChanges: string;
  delete: string;
  confirmDelete: string;
  backToDiary: string;
  
  // Statistics
  statisticsInsights: string;
  deepDive: string;
  totalMovies: string;
  avgRating: string;
  currentStreak: string;
  days: string;
  moviesWatchedOverTime: string;
  genrePreferences: string;
  emotionalProfile: string;
  mostEmotionalMovies: string;
  personalInsights: string;
  mostWatchedGenre: string;
  mostCommonEmotion: string;
  averageMovieRating: string;
  watchFrequency: string;
  moviesPerDay: string;
  noEmotionalData: string;
  startTrackingEmotions: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  save: string;
  add: string;
  search: string;
  filter: string;
  sort: string;
  
  // Recommendations
  recommendations: string;
  recommendationsDisabled: string;
  errorLoading: string;
  noRecommendationsAvailable: string;
  vote: string;
  votes: string;
  
  // Emotion Types
  happy: string;
  sad: string;
  excited: string;
  nostalgic: string;
  thoughtful: string;
  scared: string;
  romantic: string;
  angry: string;
  surprised: string;
  disgusted: string;
  tense: string;
  shocked: string;
  thrilled: string;
  melancholic: string;
  peaceful: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    movieDiary: 'Movie Diary',
    addMovie: 'Add Movie',
    statistics: 'Statistics',
    
    // Dashboard
    welcomeBack: 'Welcome back! 🎬',
    movieJourney: "Here's your movie watching journey so far",
    moviesWatched: 'Movies Watched',
    averageRating: 'Average Rating',
    emotionsTracked: 'Emotions Tracked',
    watchDays: 'Watch Days',
    moviesWatchedThisYear: 'Movies Watched This Year',
    emotionDistribution: 'Emotion Distribution',
    recentMovies: 'Recent Movies',
    viewAll: 'View all →',
    statisticsUnlockAt: 'Statistics unlock at 5 movies',
    noMoviesLogged: 'No movies logged yet',
    addFirstMovie: 'Add Your First Movie',
    
    // Movie Diary
    personalCollection: 'Your personal collection of watched movies',
    searchMovies: 'Search movies...',
    dateWatched: 'Date Watched',
    title: 'Title',
    rating: 'Rating',
    dateAdded: 'Date Added',
    newestFirst: 'Newest First',
    oldestFirst: 'Oldest First',
    noMoviesFound: 'No movies found',
    tryAdjustingSearch: 'Try adjusting your search terms',
    startBuildingDiary: 'Start building your movie diary by adding your first movie',
    
    // Add Movie
    logMovie: 'Log a movie you\'ve watched and track your emotions',
    trackEmotions: 'Track your emotions',
    searchForMovie: 'Search for Movie',
    enterMovieTitle: 'Enter movie title...',
    selectedMovie: 'Selected Movie',
    watchDetails: 'Watch Details',
    dateWatchedLabel: 'Date Watched',
    yourRating: 'Your Rating',
    outOfTen: 'out of 10',
    notes: 'Notes',
    shareThoughts: 'Share your thoughts about this movie...',
    emotions: 'Emotions',
    addNewEmotion: 'Add New Emotion',
    emotionType: 'Emotion Type',
    selectEmotion: 'Select emotion',
    intensity: 'Intensity (1-10)',
    description: 'Description (optional)',
    whyFeelThisWay: 'Why did you feel this way?',
    addEmotion: 'Add Emotion',
    addedEmotions: 'Added Emotions:',
    addMovieToDiary: 'Add Movie to Diary',
    addingMovie: 'Adding Movie...',
    
    // Movie Details
    movieInformation: 'Movie Information',
    releaseDate: 'Release Date',
    runtime: 'Runtime',
    genres: 'Genres',
    tmdbRating: 'TMDB Rating',
    overview: 'Overview',
    yourNotes: 'Your Notes',
    noOverview: 'No overview available.',
    noNotes: 'No notes added yet.',
    edit: 'Edit',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this movie from your diary?',
    backToDiary: 'Back to Diary',
    
    // Statistics
    statisticsInsights: 'Statistics & Insights',
    deepDive: 'Deep dive into your movie watching patterns and emotional journey',
    totalMovies: 'Total Movies',
    avgRating: 'Avg Rating',
    currentStreak: 'Current Streak',
    days: 'days',
    moviesWatchedOverTime: 'Movies Watched Over Time',
    genrePreferences: 'Genre Preferences',
    emotionalProfile: 'Emotional Profile',
    mostEmotionalMovies: 'Most Emotional Movies',
    personalInsights: 'Personal Insights',
    mostWatchedGenre: 'Most Watched Genre',
    mostCommonEmotion: 'Most Common Emotion',
    averageMovieRating: 'Average Movie Rating',
    watchFrequency: 'Watch Frequency',
    moviesPerDay: 'movies per day',
    noEmotionalData: 'No emotional data available yet. Start tracking emotions for your movies!',
    startTrackingEmotions: 'Start tracking emotions for your movies!',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Recommendations
    recommendations: 'Recommendations',
    recommendationsDisabled: 'Recommendations are currently disabled.',
    errorLoading: 'Failed to load recommendations.',
    noRecommendationsAvailable: 'No recommendations available.',
    vote: 'vote',
    votes: 'votes',
    
    // Emotion Types
    happy: 'Happy, joyful, delighted',
    sad: 'Sad, upset, sorrowful',
    excited: 'Excited, thrilled, enthusiastic',
    nostalgic: 'Nostalgic, touching, longing',
    thoughtful: 'Thoughtful, reflective, philosophical',
    scared: 'Scared, anxious, frightened',
    romantic: 'Romantic, loving, tender',
    angry: 'Angry, irritated, outraged',
    surprised: 'Surprised, amazed, stunned',
    disgusted: 'Disgusted, revolted, repulsed',
    tense: 'Tense, anxious, worried',
    shocked: 'Shocked, stunned, astounded',
    thrilled: 'Thrilled, excited, captivated',
    melancholic: 'Melancholic, sad, pensive',
    peaceful: 'Peaceful, calm, relaxed',
  },
  
  ru: {
    // Navigation
    dashboard: 'Главная',
    movieDiary: 'Дневник фильмов',
    addMovie: 'Добавить фильм',
    statistics: 'Статистика',
    
    // Dashboard
    welcomeBack: 'Добро пожаловать! 🎬',
    movieJourney: 'Вот ваш путь просмотра фильмов на данный момент',
    moviesWatched: 'Просмотрено фильмов',
    averageRating: 'Средняя оценка',
    emotionsTracked: 'Отслежено эмоций',
    watchDays: 'Дней просмотра',
    moviesWatchedThisYear: 'Фильмы просмотренные в этом году',
    emotionDistribution: 'Распределение эмоций',
    recentMovies: 'Недавние фильмы',
    viewAll: 'Посмотреть все →',
    statisticsUnlockAt: 'Статистика откроется после 5 фильмов',
    noMoviesLogged: 'Фильмы еще не добавлены',
    addFirstMovie: 'Добавить первый фильм',
    
    // Movie Diary
    personalCollection: 'Ваша личная коллекция просмотренных фильмов',
    searchMovies: 'Поиск фильмов...',
    dateWatched: 'Дата просмотра',
    title: 'Название',
    rating: 'Рейтинг',
    dateAdded: 'Дата добавления',
    newestFirst: 'Сначала новые',
    oldestFirst: 'Сначала старые',
    noMoviesFound: 'Фильмы не найдены',
    tryAdjustingSearch: 'Попробуйте изменить поисковые запросы',
    startBuildingDiary: 'Начните создавать свой дневник фильмов, добавив первый фильм',
    
    // Add Movie
    logMovie: 'Запишите фильм, который вы посмотрели, и отследите свои эмоции',
    trackEmotions: 'Отслеживайте свои эмоции',
    searchForMovie: 'Поиск фильма',
    enterMovieTitle: 'Введите название фильма...',
    selectedMovie: 'Выбранный фильм',
    watchDetails: 'Детали просмотра',
    dateWatchedLabel: 'Дата просмотра',
    yourRating: 'Ваша оценка',
    outOfTen: 'из 10',
    notes: 'Заметки',
    shareThoughts: 'Поделитесь своими мыслями об этом фильме...',
    emotions: 'Эмоции',
    addNewEmotion: 'Добавить новую эмоцию',
    emotionType: 'Тип эмоции',
    selectEmotion: 'Выберите эмоцию',
    intensity: 'Интенсивность (1-10)',
    description: 'Описание (необязательно)',
    whyFeelThisWay: 'Почему вы так себя чувствовали?',
    addEmotion: 'Добавить эмоцию',
    addedEmotions: 'Добавленные эмоции:',
    addMovieToDiary: 'Добавить фильм в дневник',
    addingMovie: 'Добавление фильма...',
    
    // Movie Details
    movieInformation: 'Информация о фильме',
    releaseDate: 'Дата выхода',
    runtime: 'Продолжительность',
    genres: 'Жанры',
    tmdbRating: 'Рейтинг TMDB',
    overview: 'Описание',
    yourNotes: 'Ваши заметки',
    noOverview: 'Описание недоступно.',
    noNotes: 'Заметки еще не добавлены.',
    edit: 'Редактировать',
    cancel: 'Отмена',
    saveChanges: 'Сохранить изменения',
    delete: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить этот фильм из дневника?',
    backToDiary: 'Назад к дневнику',
    
    // Statistics
    statisticsInsights: 'Статистика и аналитика',
    deepDive: 'Глубокий анализ ваших паттернов просмотра фильмов и эмоционального путешествия',
    totalMovies: 'Всего фильмов',
    avgRating: 'Средняя оценка',
    currentStreak: 'Текущая серия',
    days: 'дней',
    moviesWatchedOverTime: 'Фильмы просмотренные во времени',
    genrePreferences: 'Предпочтения жанров',
    emotionalProfile: 'Эмоциональный профиль',
    mostEmotionalMovies: 'Самые эмоциональные фильмы',
    personalInsights: 'Личные инсайты',
    mostWatchedGenre: 'Самый просматриваемый жанр',
    mostCommonEmotion: 'Самая частая эмоция',
    averageMovieRating: 'Средняя оценка фильма',
    watchFrequency: 'Частота просмотра',
    moviesPerDay: 'фильмов в день',
    noEmotionalData: 'Эмоциональные данные пока недоступны. Начните отслеживать эмоции для ваших фильмов!',
    startTrackingEmotions: 'Начните отслеживать эмоции для ваших фильмов!',
    
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    save: 'Сохранить',
    add: 'Добавить',
    search: 'Поиск',
    filter: 'Фильтр',
    sort: 'Сортировка',
    
    // Recommendations
    recommendations: 'Рекомендации',
    recommendationsDisabled: 'Рекомендации сейчас отключены.',
    errorLoading: 'Не удалось загрузить рекомендации.',
    noRecommendationsAvailable: 'Рекомендации недоступны.',
    vote: 'оценка',
    votes: 'оценок',
    
    // Emotion Types
    happy: 'Счастливый, довольный, радостный',
    sad: 'Грустный, расстроенный, печальный',
    excited: 'Взволнованный, восторженный, восхищенный',
    nostalgic: 'Ностальгический, трогательный, тоскующий',
    thoughtful: 'Задумчивый, размышляющий, философский',
    scared: 'Испуганный, тревожный, напуганный',
    romantic: 'Романтичный, влюбленный, нежный',
    angry: 'Злой, раздраженный, возмущенный',
    surprised: 'Удивленный, пораженный, ошеломленный',
    disgusted: 'Отвращенный, омерзительный, вызывающий отвращение',
    tense: 'Напряженный, взволнованный, встревоженный',
    shocked: 'Шокированный, потрясенный, пораженный',
    thrilled: 'Взволнованный, приятно возбужденный, захваченный',
    melancholic: 'Меланхоличный, грустный, задумчивый',
    peaceful: 'Спокойный, умиротворенный, расслабленный',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('rewatch-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rewatch-language', language);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
