import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  // Navigation
  dashboard: string;
  movieDiary: string;
  addMovie: string;
  statistics: string;
  feedback: string;
  installApp: string;
  
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
  emptyStateIntro: string;
  notSureWhereToStart: string;
  wantToOpenDiaryFromOtherDevices: string;
  leaveEmail: string;
  later: string;
  emailModalWithTitle: string; // expects {title}
  emailModalGeneric: string;
  emailModalTitle: string;
  yourEmail: string;
  saveEmail: string;
  savingEmail: string;
  emailPlaceholder: string;
  invalidEmail: string;
  emailRequired: string;
  
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
  addToWatchlist: string;
  addedToWatchlist: string;
  
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
  movieNotFound: string;
  movieNotFoundDescription: string;
  minutes: string;
  unknown: string;
  nA: string;
  ifYouEnjoyedThisMovie: string;
  addToWatchlistArrow: string;
  releaseDateLabel: string;
  runtimeLabel: string;
  genresLabel: string;
  tmdbRatingLabel: string;
  overviewLabel: string;
  goBack: string;
  
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
  addMoviesForRecommendations: string;
  vote: string;
  votes: string;
  noPoster: string;
  shownResults: string; // expects {shown} and {total}
  ofResults: string;
  
  // Watchlist
  myWatchlist: string;
  watchlistDescription: string;
  addMore: string;
  searchWatchlist: string;
  failedToLoadWatchlist: string;
  watchlistErrorDescription: string;
  reloadPage: string;
  watchlistEmpty: string;
  watchlistEmptyDescription: string;
  browseRecommendations: string;
  noMoviesFoundReload: string;
  
  // Dashboard
  wantToSaveEmotions: string;
  addEmailDescription: string;
  addEmail: string;
  maybeLater: string;
  send: string;
  yourEmotionsOverTime: string;
  looksLikeYouPrefer: string; // expects {emotions}
  stories: string;
  times: string;
  time: string;
  
  // Common Errors
  failedToLoadMovies: string;
  moviesErrorDescription: string;
  tryAgain: string;
  
  // Feedback
  feedbackWidgetText: string;
  feedbackWidgetButton: string;
  feedbackModalTitle: string;
  feedbackModalDescription: string;
  feedbackMessageLabel: string;
  feedbackMessagePlaceholder: string;
  feedbackMessageRequired: string;
  feedbackEmailLabel: string;
  feedbackSuccess: string;
  sendFeedback: string;
  sending: string;
  optional: string;
  
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
    feedback: 'Feedback',
    installApp: 'Install App',
    
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
    emptyStateIntro: 'Start tracking your movie journey and emotions 🤩🔥🤯 Each film you watch becomes part of your personal cinematic diary.',
    notSureWhereToStart: 'Not sure where to start?',
    wantToOpenDiaryFromOtherDevices: 'Want to open your diary from other devices? Leave your email.',
    leaveEmail: 'Leave Email',
    later: 'Later',
    emailModalWithTitle: 'We\'ll save "{title}" to your watchlist and notify you about updates.',
    emailModalGeneric: 'We\'ll save your watchlist and notify you about updates.',
    emailModalTitle: 'Leave your email',
    yourEmail: 'Your Email',
    saveEmail: 'Save Email',
    savingEmail: 'Saving...',
    emailPlaceholder: 'your@email.com',
    invalidEmail: 'Please enter a valid email address',
    emailRequired: 'Please enter your email',
    
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
    addToWatchlist: 'Add to Watchlist',
    addedToWatchlist: 'Added to watchlist',
    
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
    movieNotFound: 'Movie not found',
    movieNotFoundDescription: 'The movie you\'re looking for doesn\'t exist in your diary.',
    minutes: 'minutes',
    unknown: 'Unknown',
    nA: 'N/A',
    ifYouEnjoyedThisMovie: 'If you enjoyed this movie\'s vibe, you might also like...',
    addToWatchlistArrow: 'Add to watchlist →',
    releaseDateLabel: 'Release Date:',
    runtimeLabel: 'Runtime:',
    genresLabel: 'Genres:',
    tmdbRatingLabel: 'TMDB Rating:',
    overviewLabel: 'Overview:',
    goBack: 'Go Back',
    
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
    addMoviesForRecommendations: 'Add movies to your diary to get personalized recommendations based on films you enjoyed.',
    vote: 'vote',
    votes: 'votes',
    noPoster: 'No poster', // unused
    shownResults: 'Shown {shown} of {total} results', // unused
    ofResults: 'of results', // unused
    
    // Watchlist
    myWatchlist: 'My Watchlist',
    watchlistDescription: 'Movies you want to watch later',
    addMore: 'Add More',
    searchWatchlist: 'Search watchlist...',
    failedToLoadWatchlist: 'Failed to load watchlist',
    watchlistErrorDescription: 'There was an error loading your watchlist.',
    reloadPage: 'Reload Page',
    watchlistEmpty: 'Your watchlist is empty',
    watchlistEmptyDescription: 'Add movies from recommendations to your watchlist.',
    browseRecommendations: 'Browse Recommendations',
    noMoviesFoundReload: 'No movies found. Try reloading the page.',
    
    // Dashboard
    wantToSaveEmotions: 'Want to save your emotions and get mood-based picks?',
    addEmailDescription: 'Add your email — I\'ll send you your movie memories ❤️',
    addEmail: 'Add Email',
    maybeLater: 'Maybe Later',
    send: 'Send',
    yourEmotionsOverTime: 'Your Emotions Over Time',
    looksLikeYouPrefer: 'Looks like you prefer {emotions} stories 😉',
    stories: 'stories',
    times: 'times',
    time: 'time',
    
    // Common Errors (some unused)
    failedToLoadMovies: 'Failed to load movies',
    moviesErrorDescription: 'There was an error loading your movie diary.',
    tryAgain: 'Try Again',
    
    // Feedback
    feedbackWidgetText: 'We\'re here! Want a new feature? Found a bug? Write to the developers.',
    feedbackWidgetButton: 'Leave Feedback',
    feedbackModalTitle: 'Leave Feedback',
    feedbackModalDescription: 'Share your thoughts, report bugs, or suggest new features!',
    feedbackMessageLabel: 'Your Message',
    feedbackMessagePlaceholder: 'Tell us what you think...',
    feedbackMessageRequired: 'Please enter your message',
    feedbackEmailLabel: 'Your Email',
    feedbackSuccess: 'Thank you! Your feedback has been sent.',
    sendFeedback: 'Send Feedback',
    sending: 'Sending...',
    optional: 'optional',
    
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
    feedback: 'Обратная связь',
    installApp: 'Установить приложение',
    
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
    emptyStateIntro: 'Начните отслеживать свой путь просмотра фильмов и эмоции 🤩🔥🤯 Каждый фильм станет частью вашего личного кинематографического дневника',
    notSureWhereToStart: 'Не знаете с чего начать?',
    wantToOpenDiaryFromOtherDevices: 'Хотите открывать дневник с других устройств? Оставьте email.',
    leaveEmail: 'Оставить email',
    later: 'Позже',
    emailModalWithTitle: 'Мы сохраним «{title}» в ваш список и сообщим об обновлениях.',
    emailModalGeneric: 'Мы сохраним ваш список и сообщим об обновлениях.',
    emailModalTitle: 'Оставьте ваш email',
    yourEmail: 'Ваш Email',
    saveEmail: 'Сохранить Email',
    savingEmail: 'Сохранение...',
    emailPlaceholder: 'your@email.com',
    invalidEmail: 'Пожалуйста, введите действительный email адрес',
    emailRequired: 'Пожалуйста, введите ваш email',
    
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
    addToWatchlist: 'Добавить в watchlist',
    addedToWatchlist: 'Добавлено в watchlist',
    
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
    movieNotFound: 'Фильм не найден',
    movieNotFoundDescription: 'Фильм, который вы ищете, не существует в вашем дневнике.',
    minutes: 'минут',
    unknown: 'Неизвестно',
    nA: 'Н/Д',
    ifYouEnjoyedThisMovie: 'Если вам понравился этот фильм, вам также может понравиться...',
    addToWatchlistArrow: 'Добавить в watchlist →',
    releaseDateLabel: 'Дата выхода:',
    runtimeLabel: 'Продолжительность:',
    genresLabel: 'Жанры:',
    tmdbRatingLabel: 'Рейтинг TMDB:',
    overviewLabel: 'Описание:',
    goBack: 'Назад',
    
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
    addMoviesForRecommendations: 'Добавьте фильмы в дневник, чтобы получить персональные рекомендации на основе понравившихся вам фильмов.',
    vote: 'оценка',
    votes: 'оценок',
    noPoster: 'Нет постера', // unused
    shownResults: 'Показано {shown} из {total} результатов', // unused
    ofResults: 'из результатов', // unused
    
    // Watchlist
    myWatchlist: 'Мой список',
    watchlistDescription: 'Фильмы, которые вы хотите посмотреть позже',
    addMore: 'Добавить еще',
    searchWatchlist: 'Поиск в списке...',
    failedToLoadWatchlist: 'Не удалось загрузить список',
    watchlistErrorDescription: 'Произошла ошибка при загрузке вашего списка.',
    reloadPage: 'Перезагрузить страницу',
    watchlistEmpty: 'Ваш список пуст',
    watchlistEmptyDescription: 'Добавьте фильмы из рекомендаций в ваш список.',
    browseRecommendations: 'Просмотреть рекомендации',
    noMoviesFoundReload: 'Фильмы не найдены. Попробуйте перезагрузить страницу.',
    
    // Dashboard
    wantToSaveEmotions: 'Хотите сохранить свои эмоции и получать подборки по настроению?',
    addEmailDescription: 'Добавьте ваш email — я пришлю вам ваши киновоспоминания ❤️',
    addEmail: 'Добавить Email',
    maybeLater: 'Может быть позже',
    send: 'Отправить',
    yourEmotionsOverTime: 'Ваши эмоции со временем',
    looksLikeYouPrefer: 'Похоже, вы предпочитаете {emotions} истории 😉',
    stories: 'истории',
    times: 'раз',
    time: 'раз',
    
    // Common Errors
    failedToLoadMovies: 'Не удалось загрузить фильмы',
    moviesErrorDescription: 'Произошла ошибка при загрузке вашего дневника фильмов.',
    tryAgain: 'Попробовать снова',
    
    // Feedback
    feedbackWidgetText: 'Мы на связи! Хочешь новую фичу? Нашел ошибку? Напиши разработчикам.',
    feedbackWidgetButton: 'Оставить отзыв',
    feedbackModalTitle: 'Оставить отзыв',
    feedbackModalDescription: 'Поделитесь своими мыслями, сообщите об ошибках или предложите новые функции!',
    feedbackMessageLabel: 'Ваше сообщение',
    feedbackMessagePlaceholder: 'Расскажите, что вы думаете...',
    feedbackMessageRequired: 'Пожалуйста, введите ваше сообщение',
    feedbackEmailLabel: 'Ваш Email',
    feedbackSuccess: 'Спасибо! Ваш отзыв отправлен.',
    sendFeedback: 'Отправить отзыв',
    sending: 'Отправка...',
    optional: 'необязательно',
    
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
  // Helper function for parameterized translations
  translate: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

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

  // Helper function for parameterized translations
  // Usage: translate('emailModalWithTitle', { title: 'Movie Title' })
  const translate = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = t[key];
    
    if (params) {
      // Replace {param} with actual values
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
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
