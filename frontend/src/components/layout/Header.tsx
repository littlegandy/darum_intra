import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n/i18n';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleCollapse: () => void;
}

const Header = ({ onToggleSidebar, onToggleCollapse }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { lang, setLang, t } = useI18n();

  const handleMenuClick = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      onToggleCollapse();
    } else {
      onToggleSidebar();
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-100"
            aria-label={t('header.toggleSidebar')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/top_logo.png" alt="Darumtech Intra" className="h-10 w-auto sm:h-12" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden text-sm sm:block">
            <span className="text-gray-600">{user?.name}</span>
            <span className="ml-2 text-gray-400">({user?.departmentName || t('header.noDept')})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang('ko')}
              className={`rounded border px-2 py-1 text-xs ${
                lang === 'ko' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              KR
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded border px-2 py-1 text-xs ${
                lang === 'en' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              EN
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600 sm:px-4"
          >
            {t('header.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;


