import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { api } from '../services/api';
import { STYLES } from '../constants/styles';
import { useTranslation } from '../contexts/LanguageContext';
import { track, AnalyticsEvents } from '../utils/analytics';
import { getEmailAnalytics } from '../utils/emailAnalytics';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  movieTitle?: string;
}

/**
 * 📧 МОДАЛЬНОЕ ОКНО ДЛЯ ВВОДА EMAIL
 * 
 * Используется перед добавлением фильма в watchlist,
 * если пользователь еще не оставил email.
 */
export const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  movieTitle 
}) => {
  const { t, translate } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError(t.emailRequired);
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    setIsSubmitting(true);

    try {
      // Собираем аналитику
      const analytics = getEmailAnalytics('EmailModal');
      
      // Отправляем email на сервер с аналитикой
      await api.post('/emails', {
        email,
        ...analytics
      });
      
      // Сохраняем в localStorage, что email был отправлен
      localStorage.setItem('rewatch-email-submitted', 'true');
      console.log('✅ Email saved to localStorage:', localStorage.getItem('rewatch-email-submitted'));
      
      // Трекинг: email отправлен
      track(AnalyticsEvents.EmailSubmitted, {
        hasMovieTitle: movieTitle ? 'true' : 'false',
      });
      
      // Закрываем модальное окно и вызываем callback
      setEmail('');
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit email:', err);
      setError(err.response?.data?.error || t.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${STYLES.card} max-w-md w-full relative`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4 mx-auto">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className={`${STYLES.heading2} text-center mb-2`}>
            {t.emailModalTitle}
          </h2>
          <p className={`${STYLES.textBody} text-center text-gray-600`}>
            {movieTitle 
              ? translate('emailModalWithTitle', { title: movieTitle })
              : t.emailModalGeneric}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t.yourEmail}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder={t.emailPlaceholder}
              className={`${STYLES.inputField} ${error ? 'border-red-500' : ''}`}
              required
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`${STYLES.buttonSecondary} flex-1`}
              disabled={isSubmitting}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`${STYLES.buttonPrimary} flex-1`}
              disabled={isSubmitting}
            >
              {isSubmitting ? t.savingEmail : t.saveEmail}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

