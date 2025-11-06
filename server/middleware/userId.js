/**
 * Middleware для извлечения user_id из заголовков запроса
 * Клиент должен отправлять user_id в заголовке X-User-ID
 */
function extractUserId(req, res, next) {
  // Извлекаем user_id из заголовка X-User-ID
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    // Если user_id не передан, используем 'anonymous' для обратной совместимости
    req.userId = 'anonymous';
  } else {
    req.userId = userId;
  }
  
  next();
}

module.exports = extractUserId;

