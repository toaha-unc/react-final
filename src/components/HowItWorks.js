import React from 'react';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlusIcon,
      title: 'Create Your Account',
      description: 'Sign up in minutes and create your profile. Choose whether you want to hire or work as a freelancer.',
      step: '01'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Find the Perfect Match',
      description: 'Browse through thousands of skilled professionals or post your project and receive proposals.',
      step: '02'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Communicate & Collaborate',
      description: 'Use our built-in messaging system to discuss project details and collaborate in real-time.',
      step: '03'
    },
    {
      icon: CheckCircleIcon,
      title: 'Complete & Review',
      description: 'Review the work, make payments securely, and leave feedback to help others make informed decisions.',
      step: '04'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get started in just a few simple steps and begin your freelance journey
          </p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <div className="step-icon">
                  <step.icon />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
