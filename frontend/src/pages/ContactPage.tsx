import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../components/ui';
import { showToast } from '../components/ui/Toast';
import { contactService, tourService } from '../services';
import type { ContactRequest } from '../services/contactService';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
  color: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tourInterest: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Tour search states
  const [tourSearchQuery, setTourSearchQuery] = useState('');
  const [tourSearchResults, setTourSearchResults] = useState<any[]>([]);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [isSearchingTours, setIsSearchingTours] = useState(false);
  const tourSearchRef = useRef<HTMLDivElement>(null);

  // Contact information
  const contactInfo: ContactInfo[] = [
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: t('contact.contactInfo.phone'),
      details: [t('contact.contactInfo.phoneDetails.hotline'), t('contact.contactInfo.phoneDetails.mobile')],
      color: 'bg-blue-500'
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: t('contact.contactInfo.email'),
      details: ['info@tourcompany.vn', 'support@tourcompany.vn'],
      color: 'bg-green-500'
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: t('contact.contactInfo.address'),
      details: [t('contact.contactInfo.addressDetails.line1'), t('contact.contactInfo.addressDetails.line2')],
      color: 'bg-red-500'
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: t('contact.contactInfo.workingHours'),
      details: [t('contact.contactInfo.workingHoursDetails.weekdays'), t('contact.contactInfo.workingHoursDetails.weekend')],
      color: 'bg-purple-500'
    }
  ];

  // Search tours with debounce
  useEffect(() => {
    if (tourSearchQuery.trim().length < 2) {
      setTourSearchResults([]);
      setShowTourDropdown(false);
      return;
    }

    const searchTours = async () => {
      setIsSearchingTours(true);
      try {
        const response = await tourService.searchTours({
          keyword: tourSearchQuery,
          page: 0,
          size: 5
        });
        setTourSearchResults(response.content || []);
        setShowTourDropdown(true);
      } catch (error) {
        console.error('Error searching tours:', error);
        setTourSearchResults([]);
      } finally {
        setIsSearchingTours(false);
      }
    };

    const timeoutId = setTimeout(searchTours, 300);
    return () => clearTimeout(timeoutId);
  }, [tourSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tourSearchRef.current && !tourSearchRef.current.contains(event.target as Node)) {
        setShowTourDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTour = (tour: any) => {
    setFormData(prev => ({ ...prev, tourInterest: tour.name }));
    setTourSearchQuery(tour.name);
    setShowTourDropdown(false);
  };

  const handleClearTourSearch = () => {
    setTourSearchQuery('');
    setFormData(prev => ({ ...prev, tourInterest: '' }));
    setTourSearchResults([]);
    setShowTourDropdown(false);
  };

  // FAQ data with detailed answers
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: t('contact.faq.items.1.question'),
      answer: t('contact.faq.items.1.answer')
    },
    {
      id: 2,
      question: t('contact.faq.items.2.question'),
      answer: t('contact.faq.items.2.answer')
    },
    {
      id: 3,
      question: t('contact.faq.items.3.question'),
      answer: t('contact.faq.items.3.answer')
    },
    {
      id: 4,
      question: t('contact.faq.items.4.question'),
      answer: t('contact.faq.items.4.answer')
    },
    {
      id: 5,
      question: t('contact.faq.items.5.question'),
      answer: t('contact.faq.items.5.answer')
    },
    {
      id: 6,
      question: t('contact.faq.items.6.question'),
      answer: t('contact.faq.items.6.answer')
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errors.emailInvalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.form.errors.phoneRequired');
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('contact.form.errors.phoneInvalid');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.errors.subjectRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errors.messageRequired');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.form.errors.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error(t('contact.form.errors.formError'), t('contact.form.errors.formErrorTitle'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit contact form via API
      const contactData: ContactRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        tourInterest: formData.tourInterest || undefined
      };

      const response = await contactService.submitContact(contactData);
      
      showToast.success(
        t('contact.form.success.title'), 
        t('contact.form.success.message', { id: response.id })
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        tourInterest: ''
      });
      
    } catch (error: any) {
      const message = error.response?.data?.message || t('contact.form.error.message');
      showToast.error(t('contact.form.error.title'), message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full translate-x-32 -translate-y-32" style={{ background: '#D4AF37' }}></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full -translate-x-48 translate-y-48" style={{ background: '#D4AF37' }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
        
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-normal mb-4 tracking-tight animate-fade-in-up opacity-0">
            {t('contact.hero.title')}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed animate-fade-in-up opacity-0 delay-200">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6 animate-slide-in-left opacity-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('contact.contactInfo.title')}
                </h2>
                <p className="text-gray-600 mb-8">
                  {t('contact.contactInfo.description')}
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white border border-stone-200 rounded-none p-5 hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                    <div className="flex items-start space-x-4">
                      <div className="text-white p-3 rounded-none flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-2 tracking-tight">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 text-sm font-normal leading-relaxed">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Contact */}
              <div className="bg-stone-100 border border-stone-200 rounded-none p-6">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#D4AF37' }} />
                  <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">
                    {t('contact.contactInfo.quickContact.title')}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 font-normal leading-relaxed">
                    {t('contact.contactInfo.quickContact.description')}
                  </p>
                  <button 
                    className="w-full text-white px-6 py-3 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide inline-flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                    onClick={() => window.open('tel:19001234')}
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {t('contact.contactInfo.quickContact.callNow')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 rounded-none p-8 animate-slide-in-right opacity-0" id="contact-form">
              <div className="mb-8">
                <h2 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
                  {t('contact.form.title')}
                </h2>
                <p className="text-gray-600 font-normal leading-relaxed">
                  {t('contact.form.description')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.fields.name')} *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('contact.form.fields.namePlaceholder')}
                      error={errors.name}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.fields.email')} *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('contact.form.fields.emailPlaceholder')}
                      error={errors.email}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Phone and Tour Interest */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.fields.phone')} *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('contact.form.fields.phonePlaceholder')}
                      error={errors.phone}
                      className="w-full"
                    />
                  </div>
                  <div ref={tourSearchRef} className="relative">
                    <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                      {t('contact.form.fields.tourInterest')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tourSearchQuery}
                        onChange={(e) => setTourSearchQuery(e.target.value)}
                        onFocus={() => tourSearchQuery.length >= 2 && setShowTourDropdown(true)}
                        placeholder={t('contact.form.fields.tourSearchPlaceholder')}
                        className="w-full pl-10 pr-10 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {tourSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearTourSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                      {isSearchingTours && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-slate-700 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Tour Search Dropdown */}
                    {showTourDropdown && tourSearchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-stone-300 rounded-none shadow-lg max-h-60 overflow-y-auto">
                        {tourSearchResults.map((tour) => (
                          <button
                            key={tour.id}
                            type="button"
                            onClick={() => handleSelectTour(tour)}
                            className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                          >
                            <div className="flex items-start space-x-3">
                              {tour.mainImage && (
                                <img 
                                  src={tour.mainImage} 
                                  alt={tour.name}
                                  className="w-12 h-12 object-cover rounded-none flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">
                                  {tour.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {tour.duration} {t('common.days', { count: tour.duration })} • {tour.priceAdult?.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {showTourDropdown && tourSearchQuery.length >= 2 && tourSearchResults.length === 0 && !isSearchingTours && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-stone-300 rounded-none shadow-lg p-4">
                        <p className="text-sm text-gray-500 text-center">
                          {t('contact.form.tourSearch.noResults', { query: tourSearchQuery })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.fields.subject')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder={t('contact.form.fields.subjectPlaceholder')}
                    error={errors.subject}
                    className="w-full"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    {t('contact.form.fields.message')} *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder={t('contact.form.fields.messagePlaceholder')}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-none focus:ring-0 focus:border-slate-700 transition-colors resize-none font-normal ${
                      errors.message ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 font-normal">{errors.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 font-normal">
                    {t('contact.form.minChars', { count: formData.message.length })}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px] text-white px-8 py-3 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('contact.form.submitting')}
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        {t('contact.form.submit')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-none overflow-hidden">
            <div className="p-6 bg-stone-50 border-b border-stone-200">
              <h2 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
                {t('contact.map.title')}
              </h2>
              <p className="text-gray-600 font-normal leading-relaxed">
                {t('contact.map.description')}
              </p>
            </div>
            
            {/* Embedded Map */}
            <div className="relative h-96 bg-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326002352983!2d106.69831731533349!3d10.776530992320153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3332a4bd%3A0x5a981a5efee9fd7d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1635123456789!5m2!1svi!https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.640805332102!2d105.75986217471494!3d21.04705358715107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454c3ce577141%3A0xb1a1ac92701777bc!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUw6BpIG5ndXnDqm4gdsOgIE3DtGkgdHLGsOG7nW5nIEjDoCBO4buZaQ!5e0!3m2!1svi!2s!4v1760759195668!5m2!1svi!2s2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contact.map.title')}
              />
              
              {/* Map Overlay Info */}
              <div className="absolute top-4 left-4 bg-white rounded-none shadow-lg p-4 max-w-xs border border-stone-200">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm tracking-tight">
                      {t('contact.map.officeName')}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1 font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: t('contact.map.address') }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-none p-8">
            <h2 className="text-2xl font-normal text-slate-900 mb-8 text-center tracking-tight">
              {t('contact.faq.title')}
            </h2>
            
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={item.id} className="border border-stone-200 rounded-none overflow-hidden animate-fade-in opacity-0 hover:border-slate-700 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-stone-50 focus:bg-stone-50 focus:outline-none transition-all duration-200 flex items-center justify-between"
                  >
                    <h3 className="font-medium text-slate-900 pr-4 tracking-tight">
                      {item.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === item.id ? (
                        <ChevronUpIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedFAQ === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
                      <p className="text-gray-700 leading-relaxed font-normal text-sm">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contact CTA */}
            <div className="mt-8 text-center p-6 bg-stone-100 rounded-none border border-stone-200">
              <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">
                {t('contact.faq.noAnswer.title')}
              </h3>
              <p className="text-gray-600 mb-4 font-normal leading-relaxed">
                {t('contact.faq.noAnswer.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => window.open('tel:19001234')}
                  className="inline-flex items-center justify-center text-white px-6 py-2.5 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {t('contact.faq.noAnswer.callHotline')}
                </button>
                <button 
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center bg-white text-slate-900 px-6 py-2.5 rounded-none border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  {t('contact.faq.noAnswer.sendMessage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
