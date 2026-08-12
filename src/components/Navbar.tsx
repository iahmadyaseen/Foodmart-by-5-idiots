import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  PackageCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItemsCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Handle live search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Items', path: '/items' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact Us', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F1E4D8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* LEFT SIDE: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Logo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-[#E8483F] text-white shadow-md shadow-[#E8483F]/20 scale-[1.02]'
                      : 'text-[#242424] hover:text-[#E8483F] hover:bg-[#E8483F]/10'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER: Search Bar */}
          <div className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search fresh apples, milk, rice, chicken..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none transition-all placeholder:text-neutral-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Live Search Results Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-[#FFF9F2] transition-colors border-b border-neutral-100 last:border-0"
                    onClick={() => setSearchFocused(false)}
                  >
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">{product.categoryName} • Rs. {product.price} / {product.unit}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Controls & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-[#E8483F] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItemsCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 bg-neutral-200 text-neutral-700 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              )}
            </Link>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E8483F] text-white font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-neutral-800 truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                          Admin / Owner
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <PackageCheck className="w-4 h-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile Settings
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-[#E8483F] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-[#E8483F] hover:bg-[#C93630] text-white shadow-md shadow-[#E8483F]/20 transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-xl"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#FFF9F2] text-neutral-900 border border-neutral-200 focus:border-[#E8483F] focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-base font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-[#E8483F] text-white shadow-sm'
                    : 'text-[#242424] hover:bg-neutral-100'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-base font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-base font-semibold text-amber-700 bg-amber-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
