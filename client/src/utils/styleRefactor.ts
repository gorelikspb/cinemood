/**
 * 🔧 УТИЛИТА ДЛЯ РЕФАКТОРИНГА СТИЛЕЙ
 * 
 * Помогает найти и заменить захардкоженные стили на STYLE_OBJECTS
 */

export const STYLE_REPLACEMENTS = {
  // Inline стили → STYLE_OBJECTS
  'style={{ marginBottom: \'16px\' }}': '',
  'style={{ marginBottom: \'8px\' }}': '',
  'style={{ marginTop: \'16px\' }}': '',
  
  // Комбинации классов → STYLE_OBJECTS
  'className="flex items-center mb-6 sm:mb-8"': 'className={STYLE_OBJECTS.pageHeader.container}',
  'className="mr-3 sm:mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"': 'className={STYLE_OBJECTS.pageHeader.backButton}',
  'className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2"': 'className={STYLE_OBJECTS.pageHeader.title}',
  'className="text-gray-600 text-sm sm:text-base"': 'className={STYLE_OBJECTS.pageHeader.subtitle}',
  
  // Карточки фильмов
  'className="flex space-x-4"': 'className={STYLE_OBJECTS.movieCard.content}',
  'className="flex-1"': 'className={STYLE_OBJECTS.movieCard.info}',
  'className="font-semibold text-gray-900 mb-1"': 'className={STYLE_OBJECTS.movieCard.movieTitle}',
  
  // Формы
  'className={STYLES.spacingLarge}': 'className={STYLE_OBJECTS.formSection.container}',
  'className={STYLES.card}': 'className={STYLE_OBJECTS.searchSection.container}',
  
  // Бейджи
  'className={`${STYLES.badge} ${STYLES.badgeSuccess}`}': 'className={STYLE_OBJECTS.watchlistBadge.container}',
  'className="h-4 w-4 mr-1"': 'className={STYLE_OBJECTS.watchlistBadge.icon}',
  'className="underline font-medium"': 'className={STYLE_OBJECTS.watchlistBadge.link}',
};

/**
 * 📋 СПИСОК ФАЙЛОВ ДЛЯ ОБНОВЛЕНИЯ
 */
export const FILES_TO_UPDATE = [
  'client/src/pages/AddMovie.tsx',
  'client/src/pages/MovieDetails.tsx',
  'client/src/pages/MovieDiary.tsx',
  'client/src/pages/Dashboard.tsx',
  'client/src/pages/TMDBMovieView.tsx',
  'client/src/pages/Watchlist.tsx',
  'client/src/components/MovieForm.tsx',
  'client/src/components/MovieSearch.tsx',
  'client/src/components/Layout.tsx',
  'client/src/components/LanguageSwitcher.tsx',
];

/**
 * 🔍 ПАТТЕРНЫ ДЛЯ ПОИСКА ЗАХАРДКОЖЕННЫХ СТИЛЕЙ
 */
export const HARDCODED_PATTERNS = [
  /style=\{\{[^}]+\}\}/g,                    // style={{ ... }}
  /className="[^"]*mb-\d+[^"]*"/g,          // margin-bottom классы
  /className="[^"]*mt-\d+[^"]*"/g,          // margin-top классы
  /className="[^"]*p-\d+[^"]*"/g,           // padding классы
  /className="[^"]*space-[xy]-\d+[^"]*"/g,  // space классы
  /className="[^"]*flex[^"]*"/g,            // flex классы
  /className="[^"]*grid[^"]*"/g,            // grid классы
];

/**
 * 📝 ГЕНЕРАЦИЯ ОТЧЕТА О ЗАХАРДКОЖЕННЫХ СТИЛЯХ
 */
export const generateStyleReport = (content: string, filename: string) => {
  const issues: string[] = [];
  
  HARDCODED_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push(`${filename}: Found ${matches.length} hardcoded styles (pattern ${index + 1})`);
      matches.forEach(match => {
        issues.push(`  - ${match}`);
      });
    }
  });
  
  return issues;
};

