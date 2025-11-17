import { useAuth } from '../../contexts/AuthContext';
import { LogOut, LayoutDashboard, MessageSquare, Stethoscope, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';

// Avatar options - same as ProfilePage
const AVATAR_OPTIONS = [
  { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', name: 'Avatar 1' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', name: 'Avatar 2' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', name: 'Avatar 3' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', name: 'Avatar 4' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver', name: 'Avatar 5' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', name: 'Avatar 6' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', name: 'Avatar 7' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', name: 'Avatar 8' },
  { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', name: 'Avatar 9' },
  { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', name: 'Avatar 10' },
  { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', name: 'Avatar 11' },
  { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe', name: 'Avatar 12' },
  { id: 'avatar-13', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', name: 'Avatar 13' },
  { id: 'avatar-14', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', name: 'Avatar 14' },
  { id: 'avatar-15', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan', name: 'Avatar 15' },
  { id: 'avatar-16', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava', name: 'Avatar 16' },
  { id: 'avatar-17', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason', name: 'Avatar 17' },
  { id: 'avatar-18', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella', name: 'Avatar 18' },
  { id: 'avatar-19', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', name: 'Avatar 19' },
  { id: 'avatar-20', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte', name: 'Avatar 20' },
  { id: 'avatar-21', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin', name: 'Avatar 21' },
  { id: 'avatar-22', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia', name: 'Avatar 22' },
  { id: 'avatar-23', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', name: 'Avatar 23' },
  { id: 'avatar-24', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harper', name: 'Avatar 24' },
  { id: 'avatar-25', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry', name: 'Avatar 25' },
  { id: 'avatar-26', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn', name: 'Avatar 26' },
  { id: 'avatar-27', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander', name: 'Avatar 27' },
  { id: 'avatar-28', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abigail', name: 'Avatar 28' },
  { id: 'avatar-29', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', name: 'Avatar 29' },
  { id: 'avatar-30', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', name: 'Avatar 30' },
  { id: 'avatar-31', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel', name: 'Avatar 31' },
  { id: 'avatar-32', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth', name: 'Avatar 32' },
  { id: 'avatar-33', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jackson', name: 'Avatar 33' },
  { id: 'avatar-34', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', name: 'Avatar 34' },
  { id: 'avatar-35', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian', name: 'Avatar 35' },
  { id: 'avatar-36', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery', name: 'Avatar 36' },
  { id: 'avatar-37', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', name: 'Avatar 37' },
  { id: 'avatar-38', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ella', name: 'Avatar 38' },
  { id: 'avatar-39', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph', name: 'Avatar 39' },
  { id: 'avatar-40', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scarlett', name: 'Avatar 40' },
  { id: 'avatar-41', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carter', name: 'Avatar 41' },
  { id: 'avatar-42', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', name: 'Avatar 42' },
  { id: 'avatar-43', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owen', name: 'Avatar 43' },
  { id: 'avatar-44', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe', name: 'Avatar 44' },
  { id: 'avatar-45', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wyatt', name: 'Avatar 45' },
  { id: 'avatar-46', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria', name: 'Avatar 46' },
  { id: 'avatar-47', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew', name: 'Avatar 47' },
  { id: 'avatar-48', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily', name: 'Avatar 48' },
];

export function PatientNavbar() {
  const { profile, signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get current avatar
  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === (profile?.avatar || 'avatar-1')) || AVATAR_OPTIONS[0];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="HomeDoc Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold text-gray-900">HomeDoc</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/health-assessment" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50">
              <Stethoscope className="w-5 h-5" />
              <span className="text-sm font-medium">Health Assessment</span>
            </Link>
            <Link to="/history" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">History</span>
            </Link>
          </div>

          {/* User Profile & Sign Out */}
          <div className="hidden md:flex items-center">
            {profile && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-200 shadow-sm">
                    <img 
                      src={currentAvatar.url} 
                      alt={currentAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                    <span className="text-xs font-semibold text-red-800 bg-red-100 px-2 py-1 rounded-full">Patient</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Your Profile
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Settings
                        </Link>
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/health-assessment" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600">
            <Stethoscope className="w-5 h-5" />
            Health Assessment
          </Link>
          <Link to="/history" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600">
            <MessageSquare className="w-5 h-5" />
            History
          </Link>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {profile && (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-200 shadow-sm">
                    <img 
                      src={currentAvatar.url} 
                      alt={currentAvatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{profile.full_name}</p>
                  <p className="text-sm font-medium text-gray-500">{profile.email}</p>
                </div>
              </div>
            )}
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
