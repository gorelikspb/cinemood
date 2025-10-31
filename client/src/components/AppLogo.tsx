import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Film } from 'lucide-react';
import { APP_NAME } from '../constants/app';

interface AppLogoProps {
  variant?: 'mobile' | 'desktop';
}

/**
 * 🎬 КОМПОНЕНТ ЛОГОТИПА ПРИЛОЖЕНИЯ
 * 
 * Централизованный компонент для отображения логотипа приложения
 * в мобильной шапке и десктопном сайдбаре.
 * Все иконки и размеры задаются здесь в одном месте.
 * Логотип кликабелен и ведет на главную страницу.
 */
export const AppLogo: React.FC<AppLogoProps> = ({ variant = 'desktop' }) => {
  // Размеры иконок и текста в зависимости от варианта
  const styles = {
    mobile: {
      film: 'h-5 w-5',
      heart: 'h-6 w-6',
      text: 'text-lg'
    },
    desktop: {
      film: 'h-6 w-6',
      heart: 'h-8 w-8',
      text: 'text-xl'
    }
  };

  const currentStyles = styles[variant];

  return (
    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <Film className={`${currentStyles.film} text-gray-500`} />
      <span className={`${currentStyles.text} font-bold text-gray-900`}>
        {APP_NAME}
      </span>
      <Heart className={`${currentStyles.heart} text-primary-600`} />
    </Link>
  );
};

