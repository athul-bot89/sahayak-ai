import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: "🤖",
      title: t('about.features.aiPowered.title'),
      description: t('about.features.aiPowered.description')
    },
    {
      icon: "📚",
      title: t('about.features.digitalLibrary.title'),
      description: t('about.features.digitalLibrary.description')
    },
    {
      icon: "🎯",
      title: t('about.features.smartAnalysis.title'),
      description: t('about.features.smartAnalysis.description')
    },
    {
      icon: "🌐",
      title: t('about.features.multiLanguage.title'),
      description: t('about.features.multiLanguage.description')
    }
  ];

  const offerings = [
    t('about.offerings.item1'),
    t('about.offerings.item2'),
    t('about.offerings.item3'),
    t('about.offerings.item4'),
    t('about.offerings.item5')
  ];

  return (
    <div className="flex-grow bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">{t('about.ourMission.title')}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('about.missionDescription1')}
            </p>
            <p className="text-lg text-gray-600">
              {t('about.missionDescription2')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('about.platformFeatures')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              {t('about.whatWeOffer.title')}
            </h2>
            <div className="bg-blue-50 rounded-lg p-8">
              <ul className="space-y-4">
                {offerings.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-lg text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('about.whyChooseUs.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                {t('about.whyChooseUs.aiTechnology.title')}
              </h3>
              <p className="text-gray-600">
                {t('about.whyChooseUs.aiTechnology.description')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                {t('about.whyChooseUs.accessibility.title')}
              </h3>
              <p className="text-gray-600">
                {t('about.whyChooseUs.accessibility.description')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">
                {t('about.whyChooseUs.personalization.title')}
              </h3>
              <p className="text-gray-600">
                {t('about.whyChooseUs.personalization.description')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-orange-600">
                {t('about.whyChooseUs.community.title')}
              </h3>
              <p className="text-gray-600">
                {t('about.whyChooseUs.community.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Project Note */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-600">
                {t('about.studentProjectNote')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;