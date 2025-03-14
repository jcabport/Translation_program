import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Translate Novels with AI</h1>
          <p>
            Effortlessly translate Korean and Japanese novels with high-quality, natural-sounding results
            using Claude 3.7 AI technology.
          </p>
          <div className="hero-buttons">
            <Link to="/novels" className="btn btn-primary">
              My Novels
            </Link>
            <Link to="/novels/new" className="btn btn-secondary">
              Upload New Novel
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>High-Quality Translation</h3>
            <p>
              Powered by Claude 3.7, our translations maintain the original tone, style, and nuance
              of the source material.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔤</div>
            <h3>Name Consistency</h3>
            <p>
              Our system detects character names, locations, and special terms, allowing you to
              choose consistent translations throughout the novel.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Chapter Management</h3>
            <p>
              Easily upload, organize, and translate chapters one by one, with automatic context
              preservation between chapters.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Context Preservation</h3>
            <p>
              The system maintains context between chapters, ensuring consistent translation of
              plot elements and terminology.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Novel</h3>
            <p>Create a new novel and upload chapters in Korean or Japanese.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Translate Chapters</h3>
            <p>Translate chapters with a single click using Claude 3.7 AI.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Review Name Translations</h3>
            <p>Choose how character names and special terms should be translated.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Read Your Translated Novel</h3>
            <p>Enjoy high-quality, natural-sounding translations of your favorite novels.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Start Translating Today</h2>
        <p>Experience the power of AI-assisted novel translation.</p>
        <Link to="/novels/new" className="btn btn-primary">
          Upload Your First Novel
        </Link>
      </section>
    </div>
  );
};

export default Home;
