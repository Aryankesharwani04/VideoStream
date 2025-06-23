import React, { useState } from 'react';
import './CityPromptModal.css';

const CityPromptModal = ({ onSubmit, onClose }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      alert('Please enter your city');
      return;
    }
    onSubmit(city.trim());
  };

  return (
    <div className="city-modal-overlay">
      <div className="city-modal">
        <h3>Enter Your City</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Your city"
            className="city-input"
          />
          <div className="city-modal-actions">
            <button type="submit" className="city-submit-btn">Submit</button>
            <button type="button" className="city-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityPromptModal;
