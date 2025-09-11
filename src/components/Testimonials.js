import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content: 'FreelanceHub has been a game-changer for our business. We found amazing developers who delivered our project on time and within budget. The quality of work exceeded our expectations.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      content: 'As a freelancer, this platform has given me access to high-quality clients and projects. The payment system is secure and the communication tools are excellent.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      content: 'The talent pool on FreelanceHub is incredible. We\'ve hired writers, designers, and developers who have all been top-notch. Highly recommended!',
      rating: 5,
      avatar: 'ER'
    }
  ];

  return (
    <section id="testimonials" className="testimonials section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it - hear from our satisfied clients and freelancers
          </p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
