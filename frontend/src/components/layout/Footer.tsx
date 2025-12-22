import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import newsletterService from '../../services/newsletterService';
import toast from 'react-hot-toast';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error(t('footer.newsletter.errors.emailRequired'));
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('footer.newsletter.errors.emailInvalid'));
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      await newsletterService.subscribe(email);
      toast.success(t('footer.newsletter.success'));
      setEmail(''); // Clear input
    } catch (error: unknown) {
      toast.error((error as any).message || t('footer.newsletter.errors.subscribeFailed'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = useMemo(() => [
    { name: t('footer.quickLinks.home'), href: '/dashboard' },
    { name: t('footer.quickLinks.tours'), href: '/tours' },
    { name: t('footer.quickLinks.about'), href: '/about' },
    { name: t('footer.quickLinks.contact'), href: '/contact' },
    { name: t('footer.quickLinks.faq'), href: '/faq' },
    { name: t('footer.quickLinks.privacy'), href: '/privacy' },
  ], [t]);

  const destinations = useMemo(() => [
    { name: t('footer.destinations.hanoi'), href: '/tours?destination=hanoi' },
    { name: t('footer.destinations.hcm'), href: '/tours?destination=hcm' },
    { name: t('footer.destinations.danang'), href: '/tours?destination=danang' },
    { name: t('footer.destinations.nhatrang'), href: '/tours?destination=nhatrang' },
    { name: t('footer.destinations.dalat'), href: '/tours?destination=dalat' },
    { name: t('footer.destinations.phuquoc'), href: '/tours?destination=phuquoc' },
  ], [t]);

  const services = useMemo(() => [
    { name: t('footer.services.domestic'), href: '/tours?type=domestic' },
    { name: t('footer.services.international'), href: '/tours?type=international' },
    { name: t('footer.services.corporate'), href: '/tours?type=corporate' },
    { name: t('footer.services.selfGuided'), href: '/tours?type=self-guided' },
    { name: t('footer.services.flights'), href: '/flights' },
    { name: t('footer.services.hotels'), href: '/hotels' },
  ], [t]);

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.33-1.297L3.182 17.628l-1.935-1.935l1.937-1.937c-.807-.882-1.297-2.033-1.297-3.33s.49-2.448 1.297-3.33L1.247 5.159l1.935-1.935l1.937 1.937c.882-.807 2.033-1.297 3.33-1.297s2.448.49 3.33 1.297l1.937-1.937l1.935 1.935l-1.937 1.937c.807.882 1.297 2.033 1.297 3.33s-.49 2.448-1.297 3.33l1.937 1.937l-1.935 1.935l-1.937-1.937c-.882.807-2.033 1.297-3.33 1.297z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="text-white p-2 rounded-none mr-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-normal tracking-wide">TourBooking</h3>
                <p className="text-xs text-gray-400 font-normal tracking-wider">{t('footer.company.tagline')}</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed font-normal">
              {t('footer.company.description')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <div className="flex items-center text-gray-400 text-sm font-normal transition-colors cursor-pointer group">
                <MapPinIcon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:text-[#D4AF37]" />
                <span className="group-hover:text-[#D4AF37]">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm font-normal transition-colors cursor-pointer group">
                <PhoneIcon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:text-[#D4AF37]" />
                <span className="group-hover:text-[#D4AF37]">+84 (0) 123 456 789</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm font-normal transition-colors cursor-pointer group">
                <EnvelopeIcon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:text-[#D4AF37]" />
                <span className="group-hover:text-[#D4AF37]">info@tourbooking.com</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm font-normal transition-colors cursor-pointer group">
                <GlobeAltIcon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:text-[#D4AF37]" />
                <span className="group-hover:text-[#D4AF37]">www.tourbooking.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-medium mb-6 tracking-wider uppercase" style={{ color: '#C0C0C0' }}>{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm font-normal transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-base font-medium mb-6 tracking-wider uppercase" style={{ color: '#D4AF37' }}>{t('footer.destinations.title')}</h3>
            <ul className="space-y-3">
              {destinations.map((destination) => (
                <li key={destination.name}>
                  <Link
                    to={destination.href}
                    className="text-gray-400 hover:text-white text-sm font-normal transition-colors hover:translate-x-1 inline-block"
                  >
                    {destination.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base font-medium mb-6 tracking-wider uppercase" style={{ color: '#D4AF37' }}>{t('footer.services.title')}</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="text-gray-400 hover:text-white text-sm font-normal transition-colors hover:translate-x-1 inline-block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 py-12">
          <div className="text-center">
            <h3 className="text-xl font-normal mb-3 tracking-wide">{t('footer.newsletter.title')}</h3>
            <p className="text-gray-400 text-sm mb-6 font-normal">
              {t('footer.newsletter.description')}
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 px-5 py-3 bg-slate-800 border border-slate-700 rounded-none text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-[#D4AF37] font-normal text-sm"
                style={{ '--focus-ring-color': '#D4AF37' } as React.CSSProperties}
                disabled={isSubscribing}
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-3 text-white rounded-none transition-all text-sm font-medium tracking-wider uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                {isSubscribing ? t('footer.newsletter.processing') : t('footer.newsletter.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Links */}
            <div className="flex space-x-4 mb-6 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 transition-all hover:scale-110 p-2 border border-transparent rounded-none group"
                  style={{ '--hover-color': '#D4AF37', '--hover-border': '#D4AF37' } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#D4AF37';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right text-gray-400 text-sm font-normal">
              <p>{t('footer.copyright.text', { year: currentYear })}</p>
              <p className="mt-2 text-xs">
                {t('footer.copyright.developed')} <span style={{ color: '#D4AF37' }}>❤</span> {t('footer.copyright.location')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
