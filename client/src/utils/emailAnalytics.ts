/**
 * 📊 Хелпер для сбора аналитики при отправке email
 * 
 * Собирает информацию о пользователе, устройстве и источнике
 */

interface EmailAnalytics {
  source: string;
  userAgent: string;
  referrer: string;
  language: string;
  screenWidth: number | string;
  screenHeight: number | string;
  deviceType: string;
  browser: string;
  os: string;
}

/**
 * Определяет тип устройства по ширине экрана
 */
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Определяет браузер из User Agent
 */
function getBrowser(): string {
  if (typeof navigator === 'undefined') return '';
  
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  return 'Unknown';
}

/**
 * Определяет операционную систему из User Agent
 */
function getOS(): string {
  if (typeof navigator === 'undefined') return '';
  
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Unknown';
}

/**
 * Собирает аналитику для отправки email
 * @param source - Источник регистрации (Dashboard, Watchlist, EmailModal)
 */
export function getEmailAnalytics(source: string): EmailAnalytics {
  return {
    source: source,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    language: typeof navigator !== 'undefined' ? navigator.language : 'en',
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : '',
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : '',
    deviceType: getDeviceType(),
    browser: getBrowser(),
    os: getOS()
  };
}

