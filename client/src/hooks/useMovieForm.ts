import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { track, AnalyticsEvents } from '../utils/analytics';

/**
 * 📝 ПЕРЕИСПОЛЬЗУЕМЫЙ ХУК ДЛЯ ФОРМЫ ФИЛЬМА
 * 
 * Этот хук инкапсулирует всё состояние и логику формы для оценки фильма:
 * - Рейтинг пользователя (1-10)
 * - Заметки о фильме
 * - Дата просмотра
 * - Выбранные эмоции
 * - Описание эмоций
 * 
 * 🔄 Используется в:
 * - AddMovie.tsx (добавление нового фильма)
 * - MovieDetails.tsx (редактирование существующего)
 * 
 * 🎯 Преимущества выделения в хук:
 * - Убирает дублирование состояния
 * - Централизует логику управления формой
 * - Легче тестировать
 * - Переиспользование в разных компонентах
 */

export interface MovieFormData {
  userRating: number;
  notes: string;
  watchedDate: string;
  emotions: Array<{type: string}>;
  emotionDescription: string;
}

export interface MovieFormActions {
  setUserRating: (rating: number) => void;
  setNotes: (notes: string) => void;
  setWatchedDate: (date: string) => void;
  setEmotions: (emotions: Array<{type: string}>) => void;
  setEmotionDescription: (description: string) => void;
  handleEmotionClick: (emotion: string) => void;
  handleRemoveEmotion: (index: number) => void;
  resetForm: () => void;
  loadFormData: (data: Partial<MovieFormData>) => void;
}

export interface UseMovieFormReturn extends MovieFormData, MovieFormActions {}

/**
 * 🎬 Хук для управления состоянием формы фильма
 * 
 * @param initialData - начальные данные для формы (опционально)
 * @returns объект с состоянием формы и функциями для его изменения
 */
export const useMovieForm = (initialData?: Partial<MovieFormData>): UseMovieFormReturn => {
  // 📝 СОСТОЯНИЕ ФОРМЫ
  const [userRating, setUserRating] = useState<number>(
    initialData?.userRating ?? 5
  );
  const [notes, setNotes] = useState<string>(
    initialData?.notes ?? ''
  );
  const [watchedDate, setWatchedDate] = useState<string>(
    initialData?.watchedDate ?? new Date().toISOString().split('T')[0]
  );
  const [emotions, setEmotions] = useState<Array<{type: string}>>(
    initialData?.emotions ?? []
  );
  const [emotionDescription, setEmotionDescription] = useState<string>(
    initialData?.emotionDescription ?? ''
  );

  // 🎭 ОБРАБОТЧИК КЛИКА ПО ЭМОЦИИ
  // Добавляет эмоцию если её нет, или удаляет если уже выбрана
  const handleEmotionClick = useCallback((emotion: string) => {
    setEmotions(prev => {
      const isSelected = prev.some(e => e.type === emotion);
      
      if (isSelected) {
        // Удаляем эмоцию если уже выбрана
        logger.emotionRemoved(emotion);
        return prev.filter(e => e.type !== emotion);
      } else {
        // Добавляем новую эмоцию
        logger.emotionAdded(emotion);
        
        // Трекинг: эмоция добавлена
        track(AnalyticsEvents.AddEmotion, {
          emotionType: emotion,
        });
        
        return [...prev, { type: emotion }];
      }
    });
  }, []);

  // 🗑️ ОБРАБОТЧИК УДАЛЕНИЯ ЭМОЦИИ ПО ИНДЕКСУ
  // Используется в списке выбранных эмоций (кнопки с крестиком)
  const handleRemoveEmotion = useCallback((index: number) => {
    setEmotions(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 🔄 СБРОС ФОРМЫ К НАЧАЛЬНЫМ ЗНАЧЕНИЯМ
  const resetForm = useCallback(() => {
    setUserRating(5);
    setNotes('');
    setWatchedDate(new Date().toISOString().split('T')[0]);
    setEmotions([]);
    setEmotionDescription('');
  }, []);

  // 📥 ЗАГРУЗКА ДАННЫХ В ФОРМУ
  // Используется в MovieDetails для загрузки существующих данных фильма
  const loadFormData = useCallback((data: Partial<MovieFormData>) => {
    console.log('🔧 loadFormData called with:', {
      userRating: data.userRating,
      notes: data.notes,
      watchedDate: data.watchedDate,
      emotions: data.emotions,
      emotionsCount: data.emotions?.length || 0,
      emotionDescription: data.emotionDescription
    });
    
    if (data.userRating !== undefined) setUserRating(data.userRating);
    if (data.notes !== undefined) setNotes(data.notes);
    if (data.watchedDate !== undefined) setWatchedDate(data.watchedDate);
    if (data.emotions !== undefined) {
      console.log('😊 Setting emotions in form:', data.emotions.map((e: any) => e.type || e));
      setEmotions(data.emotions);
    }
    if (data.emotionDescription !== undefined) setEmotionDescription(data.emotionDescription);
    
    console.log('✅ loadFormData completed');
  }, []);

  return {
    // Состояние
    userRating,
    notes,
    watchedDate,
    emotions,
    emotionDescription,
    
    // Сеттеры
    setUserRating,
    setNotes,
    setWatchedDate,
    setEmotions,
    setEmotionDescription,
    
    // Обработчики
    handleEmotionClick,
    handleRemoveEmotion,
    
    // Утилиты
    resetForm,
    loadFormData,
  };
};
