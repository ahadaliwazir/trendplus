import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Star, Tv, Calendar, Heart, LogOut, User, LayoutDashboard, Settings, Users, Newspaper, Sparkles, Sun, Moon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/auth-context';
import { useTheme } from 'next-themes';
import { dramaService } from '@/services/dramaService';
import { useRef } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const { dramas } = await dramaService.getAll({ search: searchQuery, limit: 5 });
          setSearchResults(dramas);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Explore', href: '/top-rated', icon: Star, requiresAuth: false },
    { label: 'Airing', href: '/#airing', icon: Tv, requiresAuth: false },
    { label: 'News', href: '/news', icon: Newspaper, requiresAuth: false },
    { label: 'Community', href: '/social', icon: Users, requiresAuth: false }, // Keeping Community public for now as per usual, or should it be private? User request said "mylist ,etc also there is not terms..." implying mylist is private. "community" usually implies social which might be private.
    // User request: "if you are not signed in there should not be dashboard ,profile ,mylist ,etc"
    // "Community" link goes to /social. Let's look at /social page.
    // If I look at the user request again: "if you are not signed in there should not be dashboard ,profile ,mylist ,etc"
    // I entered Community in the list of things to hide in my plan?
    // "Hide "Dashboard", "Profile", "My List" from Navbar when not logged in" -> This I put in the plan.
    // "Community" was not explicitly listed in my plan to be hidden, but "etc" implies it might be.
    // However, looking at the code, `navLinks` contains 'Community' and 'Watchlist'.
    // 'Watchlist' goes to '/dashboard'. So that definitely needs to be hidden.
    // 'Community' goes to '/social'. Let's assume for now we keep it unless told otherwise, but wait.
    // The user said "profile ,mylist ,etc".
    // I will hide 'Watchlist' (which is my list/dashboard) and keep 'Community' visible but maybe it redirects if clicked?
    // Actually, 'Community' -> '/social' usually requires login.
    // I'll stick to hiding 'Watchlist' specifically as it maps to 'Dashboard'.
    { label: 'Quiz', href: '/personality-quiz', icon: Sparkles, requiresAuth: false },
    { label: 'Watchlist', href: '/dashboard', icon: Heart, requiresAuth: true },
  ].filter(link => !link.requiresAuth || isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/top-rated?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-background/80 backdrop-blur-xl border-b border-border py-2'
        : 'bg-gradient-to-b from-black/60 to-transparent border-none py-4'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Mobile Search View */}
          {isMobileSearchOpen ? (
            <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200" ref={searchRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground shrink-0"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search dramas..."
                  value={searchQuery}
                  autoFocus
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 1 && setShowResults(true)}
                  onKeyDown={handleSearch}
                  className="w-full bg-muted border border-border rounded-xl py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-primary/50"
                />

                {/* Mobile Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-12 left-0 right-0 glass border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-white/40">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                        {searchResults.map((drama) => (
                          <button
                            key={drama.id}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                            onClick={() => {
                              navigate(`/drama/${drama.slug || drama.id}`);
                              setShowResults(false);
                              setSearchQuery('');
                              setIsMobileSearchOpen(false);
                            }}
                          >
                            <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-white/5">
                              <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">{drama.title}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-white/40">
                                <span className="flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                                  {drama.rating}
                                </span>
                                <span>•</span>
                                <span>{drama.year}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                        <button
                          className="p-3 bg-white/5 text-center text-xs font-semibold text-primary hover:bg-white/10 transition-colors"
                          onClick={() => {
                            navigate(`/top-rated?search=${encodeURIComponent(searchQuery)}`);
                            setShowResults(false);
                            setIsMobileSearchOpen(false);
                          }}
                        >
                          View all results
                        </button>
                      </div>
                    ) : searchQuery.trim().length > 1 ? (
                      <div className="p-4 text-center text-xs text-white/40">
                        No dramas found
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Logo */}
              <Link to="/" className="flex items-center group gap-1.5 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform border border-white/10 text-xs md:text-base">MD</div>
                <span className="hidden sm:inline font-display text-base md:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                  MeriDrama<span className="text-primary italic">List</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-[15px] font-medium text-foreground/70 hover:text-foreground transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-4">
                {/* Desktop Search */}
                <div className="relative hidden sm:block" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search dramas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length > 1 && setShowResults(true)}
                    onKeyDown={handleSearch}
                    className="w-48 lg:w-64 bg-muted border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:ring-2 focus:ring-primary/50"
                  />

                  {/* Search Results Dropdown */}
                  {showResults && (
                    <div className="absolute top-12 left-0 right-0 glass border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-white/40">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="flex flex-col">
                          {searchResults.map((drama) => (
                            <button
                              key={drama.id}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                              onClick={() => {
                                navigate(`/drama/${drama.slug || drama.id}`);
                                setShowResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-white/5">
                                <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">{drama.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-white/40">
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                                    {drama.rating}
                                  </span>
                                  <span>•</span>
                                  <span>{drama.year}</span>
                                  <span>•</span>
                                  <span className={`capitalize ${drama.status === 'airing' ? 'text-primary' : ''}`}>
                                    {drama.status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                          <button
                            className="p-3 bg-white/5 text-center text-xs font-semibold text-primary hover:bg-white/10 transition-colors"
                            onClick={() => {
                              navigate(`/top-rated?search=${encodeURIComponent(searchQuery)}`);
                              setShowResults(false);
                            }}
                          >
                            View all results
                          </button>
                        </div>
                      ) : searchQuery.trim().length > 1 ? (
                        <div className="p-4 text-center text-xs text-white/40">
                          No dramas found for "{searchQuery}"
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Mobile Search Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden text-foreground"
                  onClick={() => setIsMobileSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>

                {/* Authentication */}
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-white/10 hover:border-primary/50 transition-all">
                        <Avatar className="h-full w-full">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-primary/20 text-white">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-white/10" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-white/50">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10" onClick={() => navigate('/profile')}>
                        <User className="w-4 h-4 text-primary" /> Profile
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem className="cursor-pointer gap-2 text-primary focus:bg-primary/10" onClick={() => navigate('/admin')}>
                          <Settings className="w-4 h-4" /> Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login" className="text-sm font-medium text-white hover:text-primary transition-colors">
                      Sign In
                    </Link>
                    <Link to="/signup">
                      <Button variant="primary" size="sm" className="rounded-full px-5 h-8 font-semibold">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}


                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-foreground"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && !isMobileSearchOpen && (
          <div className="md:hidden py-6 border-t border-white/10 animate-fade-in glass mt-2 rounded-2xl">
            <div className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center gap-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20 text-white rounded-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" className="w-full rounded-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav >
  );
};

export default Navbar;
