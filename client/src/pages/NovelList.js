import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { novelApi } from '../services/api';
import './NovelList.css';

const NovelList = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setLoading(true);
        const data = await novelApi.getNovels();
        setNovels(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch novels. Please try again later.');
        console.error('Error fetching novels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  const handleDeleteNovel = async (id) => {
    if (window.confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
      try {
        await novelApi.deleteNovel(id);
        setNovels(novels.filter(novel => novel._id !== id));
      } catch (err) {
        setError('Failed to delete novel. Please try again later.');
        console.error('Error deleting novel:', err);
      }
    }
  };

  return (
    <div className="novel-list-page">
      <div className="page-header">
        <h1>My Novels</h1>
        <Link to="/novels/new" className="btn btn-primary">
          Add New Novel
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading novels...</div>
      ) : novels.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any novels yet.</p>
          <p>Get started by adding your first novel!</p>
          <Link to="/novels/new" className="btn btn-primary">
            Add New Novel
          </Link>
        </div>
      ) : (
        <div className="novel-grid">
          {novels.map(novel => (
            <div key={novel._id} className="novel-card">
              <div className="novel-cover">
                {novel.coverImage ? (
                  <img src={novel.coverImage} alt={novel.title} />
                ) : (
                  <div className="novel-cover-placeholder">
                    <span>{novel.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="novel-info">
                <h2 className="novel-title">{novel.title}</h2>
                <p className="novel-author">by {novel.author}</p>
                <p className="novel-language">
                  {novel.sourceLanguage === 'ko' ? 'Korean' : 'Japanese'} → English
                </p>
                <p className="novel-chapters">
                  {novel.chapters?.length || 0} chapter{novel.chapters?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="novel-actions">
                <Link to={`/novels/${novel._id}`} className="btn btn-primary">
                  View
                </Link>
                <button
                  onClick={() => handleDeleteNovel(novel._id)}
                  className="btn btn-secondary"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NovelList;
