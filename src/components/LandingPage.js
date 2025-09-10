import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Services from './Services';
import HowItWorks from './HowItWorks';
import Stats from './Stats';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <Features />
      <Services />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
