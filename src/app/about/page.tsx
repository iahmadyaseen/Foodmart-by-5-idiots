import React from 'react';
import { Award, Truck, Users, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About Us - FOOD MART Marketplace',
  description: 'Learn about FOOD MART, our founders Team 5 Idiots, and our farm-fresh grocery guarantee.',
};

export default function AboutPage() {
  const teamMembers = [
    { name: 'Ahmad', role: 'Operations & Quality Lead', description: 'Ensures top-tier farm selection, fresh produce inspection, and strict cold-chain compliance.', bg: 'bg-rose-50 text-rose-600' },
    { name: 'Bilal', role: 'Product & Customer Experience', description: 'Focuses on user satisfaction, basket recommendations, and seamless digital commerce.', bg: 'bg-amber-50 text-amber-600' },
    { name: 'Muzammil', role: 'Supply Chain & Logistics', description: 'Manages express logistics hubs, fleet dispatching, and rapid delivery fulfillment.', bg: 'bg-emerald-50 text-emerald-600' },
    { name: 'Mavia', role: 'Technology & Cloud Architecture', description: 'Architects real-time inventory synchronization, order security, and cloud backend stability.', bg: 'bg-blue-50 text-blue-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#FFF9F2]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider bg-[#E8483F]/10 px-3 py-1 rounded-full">
          About Our Marketplace
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#242424] tracking-tight">
          Redefining Everyday Grocery Shopping
        </h1>
        <p className="text-base text-[#737373] leading-relaxed">
          FOOD MART is a premier online food marketplace engineered to deliver farm-fresh fruits, organic vegetables, butcher-grade meats, authentic spices and bakery goods directly to your kitchen.
        </p>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#E8483F]/10 text-[#E8483F] rounded-2xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#242424]">Farm Freshness Guaranteed</h3>
          <p className="text-sm text-[#737373] leading-relaxed">
            We source directly from certified local growers and daily wholesale hubs. Every apple, mango, tomato, and chicken cut undergoes strict quality inspections before dispatch.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#FFC857]/20 text-[#F97316] rounded-2xl flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#242424]">Insulated Cold-Chain Express</h3>
          <p className="text-sm text-[#737373] leading-relaxed">
            Our temperature-controlled delivery vehicles ensure dairy, gourmet cheeses, ice creams, and fresh cuts remain perfectly chilled from dispatch to doorstep.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#242424]">Secure Prisma ORM Database</h3>
          <p className="text-sm text-[#737373] leading-relaxed">
            Powered by high-performance Prisma ORM with strictly isolated customer records, your account details, shopping carts, and order transaction history are protected against data leaks.
          </p>
        </div>
      </div>

      {/* Meet the Founding Team Section */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider bg-[#E8483F]/10 px-3 py-1 rounded-full">
            Team 5 Idiots
          </span>
          <h2 className="text-3xl font-black text-[#242424] tracking-tight">
            Meet Team 5 Idiots — Founders & Core Builders
          </h2>
          <p className="text-sm text-[#737373]">
            FOOD MART was conceptualized, built, and launched by Team 5 Idiots (Ahmad, Bilal, Muzammil, Mavia), committed to setting new benchmarks in digital food retail.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="p-6 rounded-2xl bg-[#FFF9F2] border border-neutral-200/60 text-center space-y-3 shadow-xs">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-black shadow-sm ${member.bg}`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#242424]">{member.name}</h3>
                <p className="text-xs font-semibold text-[#E8483F] mt-0.5">{member.role}</p>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#242424] tracking-tight">
              Our Promise to Every Household
            </h2>
            <p className="text-sm text-[#737373] leading-relaxed">
              At FOOD MART, we believe access to wholesome food should be simple, transparent, and joyful. Whether stocking up on everyday pantry staples like Basmati rice and whole wheat flour or treating your family to premium fresh beef steaks and exotic fruits, we ensure standard-setting quality.
            </p>

            <ul className="space-y-3 text-sm text-[#242424]">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E8483F]" />
                Transparent pricing with free delivery on orders over Rs. 3000.
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E8483F]" />
                Real-time stock indicators so you never order out-of-stock items.
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E8483F]" />
                Instant printable and downloadable PDF receipts with Tax: Rs. 0.
              </li>
            </ul>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
              alt="Food Mart Fresh Aisle"
              className="rounded-3xl shadow-xl w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
