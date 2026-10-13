import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  ShieldCheck,
} from 'lucide-react';

interface ContactPageProps {
  onGoHome: () => void;
  onExplorePackages: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onGoHome,
  onExplorePackages,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Validation & UI State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (subject.trim().length < 4) {
      newErrors.subject = 'Subject should be at least 4 characters.';
    }

    if (!message.trim()) {
      newErrors.message = 'Please type your message.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    // Simulate instant dispatch & display "Message sent!" alert banner/modal
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedAlert(true);
      // Reset form fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({});
    }, 600);
  };

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-semibold rounded-full">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>CONTACT & NETWORK DESK</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Have questions about connecting your MikroTik router, purchasing WiFi vouchers, or applying
            as a WiFi Host? Reach out to our technical desk.
          </p>
        </div>

        {/* In-UI Alert Toast / Modal for 'Message sent!' */}
        {submittedAlert && (
          <div className="p-4 sm:p-5 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl shadow-emerald-950/40">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-200">Message sent!</h4>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out to BRISK Smart Connect. Our team will review your message and
                  respond promptly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedAlert(false)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info & Support Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold text-white">Direct Network Contact</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our network operations center (NOC) monitors active router nodes 24/7 across Kiambu,
                Nairobi, and Central Kenya.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Headquarters & NOC:</span>
                    <span className="text-slate-400">
                      Kiambu Central Market Plaza, 2nd Floor, Suite 210, Kiambu Town
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Direct Telephone / M-Pesa Desk:</span>
                    <span className="font-mono text-slate-300">+254 722 000 111 / +254 712 345 678</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Official Support Email:</span>
                    <span className="text-slate-300">support@briskconnect.co.ke</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Support Hours:</span>
                    <span className="text-slate-400">
                      Monday to Sunday: 6:00 AM – 11:00 PM (EAT)
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Chat */}
              <div className="pt-2">
                <a
                  href="https://wa.me/254722000111?text=Hello%20BRISK%20Smart%20Connect%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Business (+254 722 000 111)</span>
                </a>
              </div>
            </div>

            {/* Quick trust reassurance */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
              <span>
                All inquiries are securely logged in our technical ticket system with average response times
                under 30 minutes.
              </span>
            </div>
          </div>

          {/* Right: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Send Us a Message</h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill out the form below. We will get back to your inquiry promptly.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
              {/* Name Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g. Raymond Kamau"
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.name
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-800 focus:border-sky-400'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="e.g. raymond@example.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-800 focus:border-sky-400'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors({ ...errors, subject: '' });
                  }}
                  placeholder="e.g. Inquiry about Router Owner 14-day trial or MikroTik setup"
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.subject
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-800 focus:border-sky-400'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Describe your question, location, or setup requirements..."
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.message
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-800 focus:border-sky-400'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
