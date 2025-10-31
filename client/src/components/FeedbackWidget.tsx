import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { STYLES } from '../constants/styles';
import { useTranslation } from '../contexts/LanguageContext';

/**
 * 💬 ВИДЖЕТ ОБРАТНОЙ СВЯЗИ
 * 
 * Небольшой виджет, который появляется на страницах
 * для приглашения пользователей оставить отзыв или сообщить об ошибках.
 */
export const FeedbackWidget: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Проверяем, был ли виджет уже закрыт пользователем
  React.useEffect(() => {
    const dismissed = localStorage.getItem('rewatch-feedback-dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('rewatch-feedback-dismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`${STYLES.card} shadow-lg max-w-xs p-4 relative`}>
          {/* Кнопка закрытия */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          <div className="pr-6">
            <div className="flex items-start mb-2">
              <MessageCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className={`${STYLES.textBody} text-sm`}>
                {t.feedbackWidgetText}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className={`${STYLES.buttonPrimary} text-sm py-2 px-4 w-full`}
            >
              {t.feedbackWidgetButton}
            </button>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

