import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { STYLES } from '../constants/styles';
import { useTranslation } from '../contexts/LanguageContext';
import { track, AnalyticsEvents } from '../utils/analytics';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 💬 МОДАЛЬНОЕ ОКНО ОБРАТНОЙ СВЯЗИ
 * 
 * Позволяет пользователям отправлять отзывы,
 * сообщать об ошибках или предлагать новые фичи.
 */
export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Получаем сохраненный email, если есть
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rewatch-email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!message.trim()) {
      setError(t.feedbackMessageRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/feedback', {
        message: message.trim(),
        email: email.trim() || null,
      });
      
      // Трекинг: отзыв отправлен
      track(AnalyticsEvents.FeedbackSubmitted, {
        hasEmail: email.trim() ? 'true' : 'false',
        messageLength: message.trim().length.toString(),
      });
      
      setMessage('');
      setSuccess(true);
      
      // Закрываем модальное окно через 2 секунды после успешной отправки
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      setError(err.response?.data?.error || t.error);
    } finally {
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
            <MessageCircle className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className={`${STYLES.heading2} text-center mb-2`}>
            {t.feedbackModalTitle}
          </h2>
          <p className={`${STYLES.textBody} text-center text-gray-600`}>
            {t.feedbackModalDescription}
          </p>
        </div>

        {/* Form */}
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className={`${STYLES.textBody} text-green-600`}>
              {t.feedbackSuccess}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-2">
                {t.feedbackMessageLabel}
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError('');
                }}
                placeholder={t.feedbackMessagePlaceholder}
                rows={5}
                className={`${STYLES.textarea} ${error ? 'border-red-500' : ''}`}
                required
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div>
              <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.feedbackEmailLabel} <span className="text-gray-500 text-xs">({t.optional})</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={t.emailPlaceholder}
                className={STYLES.inputField}
                disabled={isSubmitting}
              />
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
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.sending}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    {t.sendFeedback}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

