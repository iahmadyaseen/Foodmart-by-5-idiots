import React, { useState } from 'react';
import { contactService } from '../services/contactService';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await contactService.sendMessage(formData.name, formData.email, formData.message);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact send error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider bg-[#E8483F]/10 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#242424] tracking-tight">
          Contact Food Mart Support
        </h1>
        <p className="text-sm text-[#737373] leading-relaxed">
          Have questions regarding order delivery, custom wholesale inquiries, or product availability?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-[#E8483F]/10 text-[#E8483F] rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#242424]">Shop Address</h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Qadadfi Park, Muridke, Punjab, Pakistan
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#242424]">Phone Contact</h3>
              <p className="text-xs text-[#737373] mt-1 font-semibold">
                +92 3080142899
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Mon–Sun 8:00 AM – 10:00 PM</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#242424]">Official Email</h3>
              <p className="text-xs text-[#737373] mt-1 font-mono font-semibold">
                ay8880625@gmail.com
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Direct notifications routed to store owner</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#F1E4D8] shadow-xs space-y-6">
          <h2 className="text-xl font-black text-[#242424] tracking-tight">
            Send an Inquiry
          </h2>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Thank you! Your inquiry has been sent directly to store owner ay8880625@gmail.com.</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ahmad"
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ahmad@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                Your Inquiry or Feedback *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we assist you with your grocery order?"
                className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
