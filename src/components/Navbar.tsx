'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItemsCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const router = useRouter();
  const pathname = usePathname();

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
      const filtered = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Items', path: '/items' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
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
                  href={link.path}
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
                placeholder="Search fresh groceries, organic vegetables, meats..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FFF9F2] border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E8483F] focus:bg-white transition-all text-[#242424]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Live Search Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 space-y-1">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setSearchFocused(false)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#242424] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#737373]">{product.categoryName}</p>
                      </div>
                      <span className="text-sm font-bold text-[#E8483F]">
                        Rs. {product.price}
                      </span>
                    </Link>
                  ))}
                  <div className="p-2 border-t border-neutral-100 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-[#E8483F] hover:underline"
                    >
                      View all results for &quot;{searchQuery}&quot;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Cart, Auth, Admin & Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Icon with badge */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-[#242424] transition-colors shadow-xs"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#242424]" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E8483F] text-white text-xs font-black rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-white animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown / Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-xs"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#E8483F] text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-bold text-[#242424] max-w-[100px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-bold text-[#242424] truncate">{user.name}</p>
                      <p className="text-xs text-[#737373] truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E8483F]/10 text-[#E8483F] uppercase tracking-wider">
                          Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#242424] hover:bg-[#E8483F]/10 hover:text-[#E8483F] font-bold"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#E8483F]" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#242424] hover:bg-neutral-50 font-medium"
                      >
                        <PackageCheck className="w-4 h-4 text-neutral-500" />
                        My Orders
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#242424] hover:bg-neutral-50 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                        My Profile
                      </Link>
                    </div>

                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-[#242424] hover:text-[#E8483F] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#E8483F] hover:bg-[#C93630] text-white text-sm font-bold shadow-md shadow-[#E8483F]/20 hover:scale-105 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#242424] hover:bg-neutral-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200/80 py-4 space-y-3 bg-[#FFFDF9] animate-in slide-in-from-top duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative px-2">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-[#FFF9F2] border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E8483F]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-5 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#E8483F] text-white'
                      : 'text-[#242424] hover:bg-neutral-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-base font-bold text-[#E8483F] bg-[#E8483F]/10 flex items-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
