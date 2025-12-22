import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  HomeIcon,
  TruckIcon,
  MapIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import PartnerContactForm from './PartnerContactForm';

const PartnerCTASection: React.FC = () => {
  const { t } = useTranslation();

  const benefits = useMemo(() => [
    {
      icon: UsersIcon,
      title: t('partners.cta.benefits.reach.title'),
      description: t('partners.cta.benefits.reach.description')
    },
    {
      icon: ChartBarIcon,
      title: t('partners.cta.benefits.revenue.title'),
      description: t('partners.cta.benefits.revenue.description')
    },
    {
      icon: SpeakerWaveIcon,
      title: t('partners.cta.benefits.brand.title'),
      description: t('partners.cta.benefits.brand.description')
    },
    {
      icon: UserGroupIcon,
      title: t('partners.cta.benefits.support.title'),
      description: t('partners.cta.benefits.support.description')
    }
  ], [t]);

  const partnerTypes = useMemo(() => [
    {
      icon: BuildingOffice2Icon,
      title: t('partners.cta.partnerTypes.hotel.title'),
      description: t('partners.cta.partnerTypes.hotel.description'),
      count: t('partners.cta.partnerTypes.hotel.count')
    },
    {
      icon: HomeIcon,
      title: t('partners.cta.partnerTypes.restaurant.title'),
      description: t('partners.cta.partnerTypes.restaurant.description'),
      count: t('partners.cta.partnerTypes.restaurant.count')
    },
    {
      icon: TruckIcon,
      title: t('partners.cta.partnerTypes.transport.title'),
      description: t('partners.cta.partnerTypes.transport.description'),
      count: t('partners.cta.partnerTypes.transport.count')
    },
    {
      icon: MapIcon,
      title: t('partners.cta.partnerTypes.operator.title'),
      description: t('partners.cta.partnerTypes.operator.description'),
      count: t('partners.cta.partnerTypes.operator.count')
    },
    {
      icon: CogIcon,
      title: t('partners.cta.partnerTypes.services.title'),
      description: t('partners.cta.partnerTypes.services.description'),
      count: t('partners.cta.partnerTypes.services.count')
    }
  ], [t]);

  const processSteps = useMemo(() => [
    {
      step: 1,
      title: t('partners.cta.process.steps.step1.title'),
      description: t('partners.cta.process.steps.step1.description'),
      time: t('partners.cta.process.steps.step1.time')
    },
    {
      step: 2,
      title: t('partners.cta.process.steps.step2.title'),
      description: t('partners.cta.process.steps.step2.description'),
      time: t('partners.cta.process.steps.step2.time')
    },
    {
      step: 3,
      title: t('partners.cta.process.steps.step3.title'),
      description: t('partners.cta.process.steps.step3.description'),
      time: t('partners.cta.process.steps.step3.time')
    },
    {
      step: 4,
      title: t('partners.cta.process.steps.step4.title'),
      description: t('partners.cta.process.steps.step4.description'),
      time: t('partners.cta.process.steps.step4.time')
    }
  ], [t]);

  const requirements = useMemo(() => [
    t('partners.cta.requirements.items.license'),
    t('partners.cta.requirements.items.experience'),
    t('partners.cta.requirements.items.quality'),
    t('partners.cta.requirements.items.commitment'),
    t('partners.cta.requirements.items.onlineCapability'),
    t('partners.cta.requirements.items.safety')
  ], [t]);
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('partners.cta.header.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('partners.cta.header.subtitle')}
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>{t('partners.cta.header.badges.free')}</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>{t('partners.cta.header.badges.commission')}</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>{t('partners.cta.header.badges.support')}</span>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('partners.cta.benefits.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('partners.cta.partnerTypes.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <type.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {type.description}
                  </p>
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {type.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('partners.cta.process.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-blue-200 z-0"></div>
                )}
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center text-xs text-blue-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements & Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Requirements */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('partners.cta.requirements.title')}
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💡 {t('partners.cta.requirements.noteTitle')}
                </h4>
                <p className="text-sm text-blue-800">
                  {t('partners.cta.requirements.noteDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <PartnerContactForm />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {t('partners.cta.bottomCta.title')}
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {t('partners.cta.bottomCta.subtitle')}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                {t('partners.cta.bottomCta.badges.response')}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                {t('partners.cta.bottomCta.badges.consulting')}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                {t('partners.cta.bottomCta.badges.setup')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTASection;
