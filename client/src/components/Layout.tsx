import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Film, 
  Plus, 
  Menu,
  X,
  Clock,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { STYLES } from '../constants/styles';
import { AppLogo } from './AppLogo';
import { FeedbackModal } from './FeedbackModal';
import { InstallButton } from './InstallButton';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
  onClick?: () => void; // Для элементов, которые не являются ссылками
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { t } = useTranslation();

  const navigation: NavigationItem[] = [
    { name: t.addMovie, href: '/add-movie', icon: Plus },
    { name: t.dashboard, href: '/', icon: Home },
    { name: t.movieDiary, href: '/diary', icon: Film },
    { name: 'Watchlist', href: '/watchlist', icon: Clock },
    { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
    { name: t.feedback, onClick: () => setIsFeedbackModalOpen(true), icon: MessageCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
          
          <AppLogo variant="mobile" />
          
          <LanguageSwitcher />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:shadow-none lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <AppLogo variant="desktop" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 mt-14 lg:mt-0">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isDisabled = item.disabled;
              
              // Если есть onClick, это кнопка, а не ссылка
              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isDisabled}
                    className={STYLES.navItem}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate text-base lg:text-sm">{item.name}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href || '#'}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className={isActive(item.href || '') ? STYLES.navItemActive : STYLES.navItem}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate text-base lg:text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            {/* Install Button */}
            <InstallButton />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 text-center flex-1">
                Your emotional movie journey
              </p>
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className={`min-h-screen ${isMobile ? 'pt-14' : ''}`}>
          {children}
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
};

