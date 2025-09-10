import React from 'react';
import './Stats.css';

const Stats = () => {
  const stats = [
    {
      number: '50,000+',
      label: 'Active Freelancers',
      description: 'Skilled professionals ready to work'
    },
    {
      number: '100,000+',
      label: 'Projects Completed',
      description: 'Successfully delivered projects'
    },
    {
      number: '4.9/5',
      label: 'Average Rating',
      description: 'Based on client reviews'
    },
    {
      number: '99.9%',
      label: 'Uptime',
      description: 'Reliable platform availability'
    }
  ];

  return (
    <section className="stats section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
