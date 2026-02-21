import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "👩‍💼",
      bio: "Visionary leader with 15+ years in AI innovation"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CTO",
      image: "👨‍💻",
      bio: "Technical genius specializing in machine learning"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Head of Research",
      image: "👩‍🔬",
      bio: "PhD in Computer Science, AI research expert"
    },
    {
      id: 4,
      name: "David Kumar",
      role: "Product Manager",
      image: "👨‍💼",
      bio: "Bringing AI solutions to real-world problems"
    }
  ];

  const values = [
    {
      icon: "💡",
      title: "Innovation",
      description: "Pushing boundaries in AI technology"
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Working together to achieve excellence"
    },
    {
      icon: "🌟",
      title: "Excellence",
      description: "Delivering the highest quality solutions"
    },
    {
      icon: "🌍",
      title: "Impact",
      description: "Making a positive difference globally"
    }
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
              {t('about.description')}
            </p>
            <p className="text-lg text-gray-600">
              {t('about.ourMission.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              Our Story
            </h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg">
                Founded in 2020, Sahayak AI emerged from a simple yet powerful vision: 
                to make artificial intelligence a helpful companion (Sahayak means "helper" 
                in Sanskrit) for everyone, regardless of their technical expertise.
              </p>
              <p className="text-lg">
                What started as a small team of passionate AI researchers has grown into 
                a global company serving thousands of clients across diverse industries. 
                Our journey has been marked by continuous innovation, from developing 
                proprietary algorithms to creating user-friendly interfaces that make 
                complex AI accessible to all.
              </p>
              <p className="text-lg">
                Today, we're proud to be at the forefront of the AI revolution, helping 
                businesses automate processes, gain insights from data, and create 
                exceptional user experiences. But we're just getting started – the future 
                holds endless possibilities, and we're excited to explore them with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Let's Build the Future Together
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions or want to learn more about how Sahayak AI can help your business?
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get In Touch
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;