import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { STYLES } from '../constants/styles';
import { useTranslation } from '../contexts/LanguageContext';
import { track, AnalyticsEvents } from '../utils/analytics';

/**
 * 📱 КНОПКА УСТАНОВКИ PWA
 * 
 * Показывается только если приложение можно установить.
 * Обрабатывает событие beforeinstallprompt для показа нативного промпта установки.
 */
export const InstallButton: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Обрабатываем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Предотвращаем автоматический показ промпта
      e.preventDefault();
      
      // Сохраняем событие для последующего использования
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Трекинг: промпт установки был показан
      track(AnalyticsEvents.InstallPromptShown);
    };

    // Обрабатываем успешную установку
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Трекинг: PWA был установлен
      track(AnalyticsEvents.InstalledPWA);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Показываем нативный промпт установки
      deferredPrompt.prompt();
      
      // Ждем выбора пользователя
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      // Очищаем промпт
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className={`${STYLES.buttonSecondary} flex items-center gap-2`}
      title={t.installApp || 'Install App'}
    >
      <Download className="h-4 w-4" />
      <span>{t.installApp || 'Install App'}</span>
    </button>
  );
};

