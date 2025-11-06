/**
 * Утилита для работы с user_id
 * Генерирует уникальный ID пользователя при первом посещении и сохраняет в localStorage
 */

const USER_ID_KEY = 'cinemood_user_id';

/**
 * Генерирует уникальный ID пользователя
 */
function generateUserId(): string {
  // Используем комбинацию timestamp и случайного числа для уникальности
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Получает или создает user_id для текущего пользователя
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    // SSR - возвращаем временный ID
    return 'anonymous';
  }

  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Генерируем новый ID и сохраняем
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('🆕 Generated new user ID:', userId);
  }

  return userId;
}

/**
 * Сбрасывает user_id (для тестирования)
 */
export function resetUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
    console.log('🔄 User ID reset');
  }
}

