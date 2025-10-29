import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { EMOTION_TYPES, getEmotionData } from '../constants/emotions';
import { STYLES } from '../constants/styles';

/**
 * 📝 ПЕРЕИСПОЛЬЗУЕМАЯ ФОРМА ФИЛЬМА
 * 
 * Этот компонент содержит общую логику для:
 * - Оценки фильма (1-10 с эмодзи)
 * - Выбора эмоций (сетка с кнопками)
 * - Заметок пользователя
 * - Даты просмотра
 * - Описания эмоций
 * 
 * 🔄 Используется в:
 * - AddMovie.tsx (добавление нового фильма)
 * - MovieDetails.tsx (редактирование существующего)
 * 
 * 🎯 Преимущества выделения в компонент:
 * - Единообразный интерфейс
 * - Легче поддерживать изменения
 * - Переиспользование логики
 */

interface MovieFormProps {
  // Значения формы
  userRating: number;
  notes: string;
  watchedDate: string;
  emotions: Array<{type: string}>;
  emotionDescription: string;
  
  // Обработчики изменений
  onRatingChange: (rating: number) => void;
  onNotesChange: (notes: string) => void;
  onWatchedDateChange: (date: string) => void;
  onEmotionClick: (emotion: string) => void;
  onRemoveEmotion: (index: number) => void;
  onEmotionDescriptionChange: (description: string) => void;
  
  // Опциональные настройки
  showDateFirst?: boolean;  // Для AddMovie дата сверху, для MovieDetails - снизу
  className?: string;
}

export const MovieForm: React.FC<MovieFormProps> = ({
  userRating,
  notes,
  watchedDate,
  emotions,
  emotionDescription,
  onRatingChange,
  onNotesChange,
  onWatchedDateChange,
  onEmotionClick,
  onRemoveEmotion,
  onEmotionDescriptionChange,
  showDateFirst = false,
  className = ""
}) => {
  const { t } = useTranslation();

  // 🎭 ЭМОДЗИ ДЛЯ РЕЙТИНГА
  // Визуальная обратная связь для оценки 1-10
  const getRatingEmoji = (rating: number) => {
    if (rating === 1) return '😢';
    if (rating === 2) return '😞';
    if (rating === 3) return '😔';
    if (rating === 4) return '😕';
    if (rating === 5) return '😐';
    if (rating === 6) return '🙂';
    if (rating === 7) return '😊';
    if (rating === 8) return '😄';
    if (rating === 9) return '😁';
    if (rating === 10) return '🤩';
    return '😐';
  };

  // 📅 КОМПОНЕНТ ДАТЫ
  const DateField = () => (
    <div>
      <label className={STYLES.label}>
        {t.dateWatched}
      </label>
      <input
        type="date"
        value={watchedDate}
        onChange={(e) => onWatchedDateChange(e.target.value)}
        className={STYLES.inputField}
      />
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Дата сверху (для AddMovie) */}
      {showDateFirst && (
        <div className={STYLES.card}>
          <DateField />
        </div>
      )}

      {/* Рейтинг и заметки */}
      <div className={STYLES.card}>
        <div className="space-y-4">
          {/* 🌟 РЕЙТИНГ */}
          <div>
            <label className={STYLES.label}>
              {t.yourRating}
            </label>
            <div className={STYLES.ratingContainer}>
              <input
                type="range"
                min="1"
                max="10"
                value={userRating}
                onChange={(e) => onRatingChange(parseInt(e.target.value))}
                className={STYLES.ratingSlider}
              />
              <span className={STYLES.ratingValue}>
                {userRating}/10
              </span>
            </div>
            <div className={STYLES.ratingEmoji}>
              {getRatingEmoji(userRating)}
            </div>
          </div>

          {/* 📝 ЗАМЕТКИ */}
          <div>
            <label className={STYLES.label}>
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t.shareThoughts}
              rows={3}
              className={STYLES.textarea}
            />
          </div>

          {/* Дата снизу (для MovieDetails) */}
          {!showDateFirst && <DateField />}
        </div>
      </div>

      {/* 🎭 ЭМОЦИИ */}
      <div className={STYLES.card}>
        <h3 className={`${STYLES.heading4} mb-4`}>
          {t.emotions}
        </h3>
        
        {/* Сетка эмоций */}
        <div className={STYLES.emotionGrid}>
          {EMOTION_TYPES.map(emotion => {
            const isSelected = emotions.some(e => e.type === emotion);
            return (
              <button
                key={emotion}
                type="button"
                onClick={() => onEmotionClick(emotion)}
                className={isSelected ? STYLES.emotionButtonActive : STYLES.emotionButton}
                title={getEmotionData(emotion, t).tooltip}
              >
                <div className="text-3xl">
                  {getEmotionData(emotion, t).emoji}
                </div>
              </button>
            );
          })}
        </div>

        {/* Описание эмоций */}
        {emotions.length > 0 && (
          <div className="mt-3">
            <label className={STYLES.label}>
              {t.description}
            </label>
            <input
              type="text"
              value={emotionDescription}
              onChange={(e) => onEmotionDescriptionChange(e.target.value)}
              placeholder={t.whyFeelThisWay}
              className={STYLES.inputField}
            />
          </div>
        )}

        {/* Список выбранных эмоций */}
        {emotions.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion, index) => (
                <button
                  key={index}
                  onClick={() => onRemoveEmotion(index)}
                  className={STYLES.emotionBadge}
                >
                  <span className="text-lg">
                    {getEmotionData(emotion.type, t).emoji}
                  </span>
                  <span className={STYLES.textMuted}>×</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
