import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BuyerReviews from './BuyerReviews';
import SellerReviews from './SellerReviews';
import Header from './Header';

const Reviews = () => {
  const { isBuyer, isSeller } = useAuth();

  return (
    <div className="reviews-page">
      <Header />
      <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
        {isBuyer && <BuyerReviews />}
        {isSeller && <SellerReviews />}
        {!isBuyer && !isSeller && (
          <div className="no-role-message">
            <h1>Reviews</h1>
            <p>Please log in to view your reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
