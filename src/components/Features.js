import React from 'react';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Verified Professionals',
      description: 'All freelancers go through a rigorous verification process to ensure quality and reliability.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'Your payments are protected with our secure escrow system and money-back guarantee.'
    },
    {
      icon: ClockIcon,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support team.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fair Pricing',
      description: 'Transparent pricing with no hidden fees. Pay only for what you get.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Communication',
      description: 'Stay connected with your freelancer through our built-in messaging system.'
    },
    {
      icon: ChartBarIcon,
      title: 'Project Tracking',
      description: 'Monitor your project progress with detailed analytics and milestone tracking.'
    }
  ];

  return (
    <section id="features" className="features section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose FreelanceWork?</h2>
          <p className="section-subtitle">
            We provide everything you need to succeed in the freelance marketplace
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
