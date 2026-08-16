import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFF4E8] text-[#242424] pt-16 pb-8 border-t border-[#F1E4D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-[#F1E4D8]">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1E4D8]">
            <div className="p-3 bg-[#E8483F]/10 text-[#E8483F] rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#242424]">Free Express Delivery</h4>
              <p className="text-xs text-[#737373]">On all orders above Rs. 3000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1E4D8]">
            <div className="p-3 bg-[#FFC857]/20 text-[#F97316] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#242424]">100% Quality Guarantee</h4>
              <p className="text-xs text-[#737373]">Farm-fresh produce & meats</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1E4D8]">
            <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#242424]">Same-Day Slot</h4>
              <p className="text-xs text-[#737373]">Order before 2 PM daily</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1E4D8]">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#242424]">Customer Care</h4>
              <p className="text-xs text-[#737373]">Dedicated assistance 7 days/week</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#F1E4D8]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-[#737373] max-w-sm leading-relaxed">
              Fresh groceries. Better everyday. Your trusted online food marketplace for fresh fruits, vegetables, prime meats, dairy, bakery, and pantry staples delivered with care.
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#242424] font-medium">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E8483F] shrink-0" />
                Qadadfi Park, Muridke, Punjab, Pakistan
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E8483F] shrink-0" />
                +92 3080142899
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E8483F] shrink-0" />
                ay8880625@gmail.com
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-[#737373]">
              <li>
                <Link href="/" className="hover:text-[#E8483F] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E8483F] transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/items" className="hover:text-[#E8483F] transition-colors">Items & Categories</Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-[#E8483F] transition-colors">Customer Reviews</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E8483F] transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider mb-4">Customer Account</h3>
            <ul className="space-y-2.5 text-sm text-[#737373]">
              <li>
                <Link href="/profile" className="hover:text-[#E8483F] transition-colors">My Account</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#E8483F] transition-colors">My Orders</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#E8483F] transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#E8483F] transition-colors">Checkout</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider mb-4">Support & Legal</h3>
            <ul className="space-y-2.5 text-sm text-[#737373]">
              <li>
                <Link href="/contact" className="hover:text-[#E8483F] transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E8483F] transition-colors">Delivery FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E8483F] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E8483F] transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & TEAM MANDATE */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <p>© 2026 FOOD MART. All rights reserved.</p>
          <p className="font-semibold text-[#242424] bg-white px-4 py-2 rounded-full border border-[#F1E4D8] shadow-xs tracking-wide">
            Developed by: <span className="text-[#E8483F] font-black">TEAM 5 IDIOTS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
