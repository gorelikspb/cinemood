# 🎨 Система стилей приложения

## Проблема

Раньше в коде было много хардкода Tailwind CSS классов:

```tsx
// ❌ ПЛОХО - хардкод стилей
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Title
  </h3>
  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
    Click me
  </button>
</div>
```

**Проблемы:**
- Дублирование кода
- Сложно поддерживать
- Непоследовательный дизайн
- Трудно менять стили глобально

## Решение

Создали централизованную систему стилей с семантическими названиями:

```tsx
// ✅ ХОРОШО - семантические стили
<div className={STYLES.card}>
  <h3 className={STYLES.heading4}>
    Title
  </h3>
  <button className={STYLES.buttonPrimary}>
    Click me
  </button>
</div>
```

**Ключевое решение:** Убрали `COMBINED_STYLES` - каждый стиль теперь самодостаточен!

## Структура системы

### 📦 Основные категории

1. **Контейнеры и лейауты**
   - `page`, `container`, `card`
   
2. **Кнопки**
   - `button`, `buttonPrimary`, `buttonSecondary`, `buttonDanger`
   
3. **Формы**
   - `inputField`, `textarea`, `label`
   
4. **Типография**
   - `heading1`, `heading2`, `heading3`, `heading4`
   - `textBody`, `textMuted`, `textSmall`
   
5. **Специализированные**
   - `emotionGrid`, `movieCard`, `navItem`

### 🎯 Самодостаточные стили

Каждый стиль содержит все необходимые классы:

```tsx
// ✅ Простое использование - один класс, всё включено
<button className={STYLES.buttonPrimary}>Primary Button</button>
<button className={STYLES.buttonSecondary}>Secondary Button</button>
<button className={STYLES.emotionButtonActive}>Active Emotion</button>

// ❌ Больше НЕ нужно комбинировать
// className={`${STYLES.button} ${STYLES.buttonPrimary}`}
```

## Принципы именования

### 📋 Семантические названия

- **НЕ** `redButton` → **ДА** `buttonDanger`
- **НЕ** `bigText` → **ДА** `heading2`
- **НЕ** `grayBox` → **ДА** `card`

### 🏷️ Модификаторы

- Размеры: `buttonSmall`, `buttonLarge`
- Состояния: `buttonDisabled`, `inputError`
- Варианты: `buttonPrimary`, `buttonSecondary`

### 🎯 Контекст

- `movieCard` - для карточек фильмов
- `emotionGrid` - для сетки эмоций
- `navItem` - для элементов навигации

## Использование

### 1. Импорт

```tsx
import { STYLES } from '../constants/styles';
```

### 2. Простое использование

```tsx
<div className={STYLES.card}>
  <h2 className={STYLES.heading2}>Title</h2>
  <p className={STYLES.textBody}>Content</p>
</div>
```

### 3. Дополнительные классы

```tsx
<button className={`${STYLES.buttonPrimary} w-full`}>
  Full width primary button
</button>
```

### 4. Условные стили

```tsx
<button 
  className={isDisabled ? STYLES.buttonDisabled : STYLES.buttonPrimary}
>
  Dynamic button
</button>
```

## Миграция

### До

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotions</h3>
  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
    <button className="relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center border-primary-600 bg-primary-50">
      😊
    </button>
  </div>
</div>
```

### После

```tsx
<div className={STYLES.card}>
  <h3 className={STYLES.heading4}>Emotions</h3>
  <div className={STYLES.emotionGrid}>
    <button className={STYLES.emotionButtonActive}>
      😊
    </button>
  </div>
</div>
```

## Преимущества

### ✅ Что получили

1. **Консистентность** - одинаковые стили везде
2. **Поддерживаемость** - изменения в одном месте
3. **Читаемость** - понятные названия
4. **Переиспользование** - готовые комбинации
5. **Типизация** - автодополнение в IDE

### 📊 Метрики

- **Удалено хардкода:** ~300 строк
- **Создано стилей:** 70+ семантических классов  
- **Покрытие компонентов:** 7/8 обновлено
- **Убрано COMBINED_STYLES:** Упрощена архитектура

## Расширение системы

### Добавление нового стиля

```tsx
// В constants/styles.ts
export const STYLES = {
  // ... существующие стили
  newComponent: 'bg-blue-100 border border-blue-200 rounded-lg p-4',
  newComponentActive: 'bg-blue-100 border border-blue-200 rounded-lg p-4 bg-blue-200 border-blue-300',
};
```

**Принцип:** Каждый стиль самодостаточен и содержит ВСЕ необходимые классы.

### Рефакторинг существующего компонента

1. Найти повторяющиеся классы
2. Создать семантическое название
3. Добавить в `STYLES`
4. Заменить в компонентах
5. Создать `COMBINED_STYLES` если нужно

## Следующие шаги

1. ✅ MovieForm, Layout, AddMovie, MovieDetails, Dashboard, MovieDiary
2. 📋 MovieSearch - последний компонент
3. 🎯 Создать Storybook для демонстрации стилей
4. 📚 Добавить TypeScript типы для стилей
5. 🧹 Удалить неиспользуемые CSS классы из index.css
