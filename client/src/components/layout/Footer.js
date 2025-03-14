import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Novel Translator. All rights reserved.</p>
        <p>Powered by Claude 3.7 for high-quality novel translations.</p>
      </div>
    </footer>
  );
};

export default Footer;
