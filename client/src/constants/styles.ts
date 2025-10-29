/**
 * 🎨 СИСТЕМА СТИЛЕЙ ПРИЛОЖЕНИЯ
 * 
 * Централизованные CSS классы для всех компонентов.
 * Используем базовые стили + цветовую палитру для избежания дублирования.
 * 
 * 📋 Принципы:
 * - Базовые стили (button, card, input) + цветовые модификаторы
 * - Семантическая палитра цветов
 * - Наследование общих свойств
 */

// 🎨 ЦВЕТОВАЯ ПАЛИТРА
const COLORS = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
  
  // Для эмоций
  emotionDefault: 'border-gray-200 hover:border-gray-300 bg-white',
  emotionActive: 'border-primary-600 bg-primary-50',
  
  // Для навигации  
  navDefault: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
  navActive: 'bg-primary-100 text-primary-700',
  navDisabled: 'text-gray-400 cursor-not-allowed',
};

// 🏗️ БАЗОВЫЕ КОМПОНЕНТЫ
const BASE = {
  button: 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  buttonSmall: 'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  buttonLarge: 'px-6 py-3 text-lg rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  card: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
  
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200',
  
  emotionButton: 'relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center',
  
  navItem: 'flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-sm font-medium transition-colors duration-200 touch-manipulation',
};

export const STYLES = {
  // 📦 КОНТЕЙНЕРЫ И ЛЕЙАУТЫ
  page: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  pageNoPadding: 'max-w-7xl mx-auto',
  container: 'max-w-4xl mx-auto',
  containerSmall: 'max-w-2xl mx-auto',
  
  // 🃏 КАРТОЧКИ
  card: BASE.card,
  cardSmall: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
  cardHover: `${BASE.card} hover:shadow-md transition-shadow cursor-pointer`,
  
  // 🔘 КНОПКИ (базовый стиль + цветовая схема)
  button: `${BASE.button} ${COLORS.secondary}`,
  buttonPrimary: `${BASE.button} ${COLORS.primary}`,
  buttonSecondary: `${BASE.button} ${COLORS.secondary}`,
  buttonDanger: `${BASE.button} ${COLORS.danger}`,
  buttonSuccess: `${BASE.button} ${COLORS.success}`,
  buttonDisabled: `${BASE.button} ${COLORS.disabled}`,
  buttonSmall: `${BASE.buttonSmall} ${COLORS.secondary}`,
  buttonLarge: `${BASE.buttonLarge} ${COLORS.secondary}`,
  
  // 📝 ФОРМЫ
  inputField: BASE.input,
  inputError: `${BASE.input} border-red-300 focus:ring-red-500 focus:border-red-500`,
  textarea: `${BASE.input} resize-none`,
  label: 'block text-sm font-medium text-gray-700 mb-1',
  labelRequired: 'block text-sm font-medium text-gray-700 mb-1 after:content-["*"] after:text-red-500 after:ml-1',
  
  // 🎭 ЭМОЦИИ
  emotionGrid: 'grid grid-cols-5 sm:grid-cols-6 gap-2',
  emotionButton: `${BASE.emotionButton} ${COLORS.emotionDefault}`,
  emotionButtonActive: `${BASE.emotionButton} ${COLORS.emotionActive}`,
  emotionBadge: 'flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm transition-colors',
  
  // 🎬 ФИЛЬМЫ
  movieCard: 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group',
  moviePoster: 'w-full rounded-lg object-cover',
  moviePosterSmall: 'w-24 h-36 object-cover rounded',
  moviePosterIcon: 'w-24 h-36 bg-gray-200 rounded flex items-center justify-center',
  movieGrid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  movieList: 'space-y-4',
  
  // 🔍 ПОИСК
  searchContainer: 'relative',
  searchInput: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  searchIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400',
  searchResults: 'absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto',
  searchResultItem: 'flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0',
  
  // 📊 РЕЙТИНГ
  ratingContainer: 'flex items-center justify-between space-x-2 mb-2',
  ratingSlider: 'flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider',
  ratingValue: 'text-sm font-medium text-gray-700 min-w-[2rem] text-center',
  ratingEmoji: 'text-6xl flex items-center justify-center',
  
  // 🏷️ БЕЙДЖИ И ТЕГИ
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-100 text-green-800',
  badgeWarning: 'bg-yellow-100 text-yellow-800',
  badgeError: 'bg-red-100 text-red-800',
  badgeInfo: 'bg-blue-100 text-blue-800',
  badgeGray: 'bg-gray-100 text-gray-800',
  
  // 📱 НАВИГАЦИЯ
  nav: 'space-y-1',
  navItem: `${BASE.navItem} ${COLORS.navDefault}`,
  navItemActive: `${BASE.navItem} ${COLORS.navActive}`,
  navItemDisabled: `${BASE.navItem} ${COLORS.navDisabled}`,
  
  // 📄 ТИПОГРАФИЯ
  heading1: 'text-3xl font-bold text-gray-900',
  heading2: 'text-2xl font-bold text-gray-900',
  heading3: 'text-xl font-semibold text-gray-900',
  heading4: 'text-lg font-semibold text-gray-900',
  textBody: 'text-gray-700',
  textMuted: 'text-gray-500',
  textSmall: 'text-sm text-gray-600',
  textError: 'text-red-600',
  textSuccess: 'text-green-600',
  
  // 📏 ОТСТУПЫ И РАЗМЕРЫ
  spacingSmall: 'space-y-2',
  spacingMedium: 'space-y-4',
  spacingLarge: 'space-y-6',
  spacingXLarge: 'space-y-8',
  
  // 🔄 СОСТОЯНИЯ
  loading: 'animate-pulse',
  loadingText: 'text-center py-12 text-gray-600',
  errorText: 'text-center py-12 text-red-600',
  emptyState: 'text-center py-12 text-gray-500',
  
  // 🎨 УТИЛИТЫ
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  grid2: 'grid grid-cols-2 gap-4',
  grid3: 'grid grid-cols-3 gap-4',
  grid4: 'grid grid-cols-4 gap-4',
  gridResponsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  
  // 📱 АДАПТИВНОСТЬ
  hiddenMobile: 'hidden sm:block',
  hiddenDesktop: 'block sm:hidden',
  mobileOnly: 'sm:hidden',
  desktopOnly: 'hidden sm:block',
  
  // 🎯 СПЕЦИАЛЬНЫЕ
  stickyHeader: 'sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-4',
  backdrop: 'fixed inset-0 bg-black bg-opacity-50 z-40',
  modal: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  tooltip: 'absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg',
};

/**
 * 📦 ОБЪЕКТЫ СТИЛЕЙ ДЛЯ КОМПОНЕНТОВ
 * 
 * Предварительно собранные комбинации стилей для передачи в компоненты.
 * Используется вместо inline стилей или множественных className.
 */
export const STYLE_OBJECTS = {
  // 🎬 КАРТОЧКИ ФИЛЬМОВ
  movieCard: {
    container: STYLES.card,
    header: `${STYLES.flexBetween} ${STYLES.spacingMedium}`,
    title: STYLES.heading4,
    poster: STYLES.moviePosterSmall,
    posterIcon: STYLES.moviePosterIcon,
    content: 'flex space-x-4',
    info: 'flex-1',
    movieTitle: 'font-semibold text-gray-900 mb-1',
    year: `${STYLES.textSmall} ${STYLES.spacingSmall}`,
    overview: `${STYLES.textSmall} line-clamp-3`,
  },

  // 📝 ФОРМЫ
  formSection: {
    container: STYLES.spacingLarge,
    header: `${STYLES.heading4} ${STYLES.spacingMedium}`,
    content: STYLES.spacingMedium,
  },

  // 🏷️ БЕЙДЖИ И МЕТКИ
  watchlistBadge: {
    container: `${STYLES.badge} ${STYLES.badgeSuccess}`,
    icon: 'h-4 w-4 mr-1',
    link: 'underline font-medium',
  },

  // 📱 ШАПКИ СТРАНИЦ
  pageHeader: {
    container: 'flex items-center mb-6 sm:mb-8',
    backButton: 'mr-3 sm:mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation',
    content: 'div',
    title: 'text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2',
    subtitle: 'text-gray-600 text-sm sm:text-base',
  },

  // 🔍 ПОИСК
  searchSection: {
    container: STYLES.card,
    header: `${STYLES.heading4} ${STYLES.spacingMedium}`,
  },

  // 🔎 КОМПОНЕНТ ПОИСКА
  movieSearch: {
    container: 'movie-search',
    inputWrapper: 'relative',
    searchIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400',
    input: `w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
            transition-colors`,
    inputCompact: 'py-1.5 text-sm',
    inputDisabled: 'bg-gray-100 cursor-not-allowed',
    resultsContainer: 'mt-2 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg',
    resultsContainerCompact: 'max-h-64',
    loadingContainer: 'text-center py-4',
    loadingSpinner: 'animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto',
    loadingText: 'text-sm text-gray-500 mt-2',
    resultsList: 'divide-y divide-gray-100',
    resultItem: 'w-full text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 p-3',
    resultItemCompact: 'p-2',
    posterContainer: 'flex-shrink-0',
    posterImage: 'rounded object-cover',
    posterPlaceholder: 'bg-gray-200 rounded flex items-center justify-center',
    movieInfo: 'flex-1 min-w-0',
    movieTitle: 'font-medium text-gray-900 truncate',
    movieYear: 'text-sm text-gray-500',
    noResults: 'text-center py-4 text-gray-500',
  },
};

/**
 * 🏗️ АРХИТЕКТУРА СТИЛЕЙ
 * 
 * Система построена на принципе композиции:
 * 
 * 1. COLORS - палитра цветовых схем (primary, danger, success, etc.)
 * 2. BASE - базовые компоненты (button, card, input, etc.)  
 * 3. STYLES - финальные стили = BASE + COLORS + специфичные классы
 * 4. STYLE_OBJECTS - предсобранные комбинации для компонентов
 * 
 * Преимущества:
 * ✅ Нет дублирования кода
 * ✅ Легко менять цвета глобально
 * ✅ Консистентные размеры и отступы
 * ✅ Простое добавление новых вариантов
 * ✅ Нет inline стилей
 * 
 * Пример использования:
 * <div className={STYLE_OBJECTS.movieCard.container}>
 *   <div className={STYLE_OBJECTS.movieCard.header}>
 *     <h3 className={STYLE_OBJECTS.movieCard.title}>Title</h3>
 *   </div>
 * </div>
 */