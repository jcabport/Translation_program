import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>Novel Translator</h1>
          </Link>
        </div>
        <nav className="nav">
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/novels">My Novels</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
