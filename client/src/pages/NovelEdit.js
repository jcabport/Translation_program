import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { novelApi } from '../services/api';
import './NovelEdit.css';

const NovelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState({
    title: '',
    author: '',
    sourceLanguage: 'ko',
    targetLanguage: 'en',
    description: '',
    coverImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isNewNovel = id === 'new';

  useEffect(() => {
    const fetchNovel = async () => {
      if (isNewNovel) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const novelData = await novelApi.getNovel(id);
        setNovel(novelData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch novel details. Please try again later.');
        console.error('Error fetching novel details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovel();
  }, [id, isNewNovel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovel({
      ...novel,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isNewNovel) {
        const createdNovel = await novelApi.createNovel(novel);
        setSuccess(true);
        // Redirect to the novel detail page after a short delay
        setTimeout(() => {
          navigate(`/novels/${createdNovel._id}`);
        }, 1500);
      } else {
        await novelApi.updateNovel(id, novel);
        setSuccess(true);
        // Redirect to the novel detail page after a short delay
        setTimeout(() => {
          navigate(`/novels/${id}`);
        }, 1500);
      }
    } catch (err) {
      setError(`Failed to ${isNewNovel ? 'create' : 'update'} novel. Please try again later.`);
      console.error(`Error ${isNewNovel ? 'creating' : 'updating'} novel:`, err);
    }
  };

  if (loading) {
    return <div className="loading">Loading novel details...</div>;
  }

  return (
    <div className="novel-edit-page">
      <div className="page-header">
        <h1>{isNewNovel ? 'Create New Novel' : 'Edit Novel'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Novel {isNewNovel ? 'created' : 'updated'} successfully!
        </div>
      )}

      <div className="novel-edit-form card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={novel.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              className="form-control"
              value={novel.author}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sourceLanguage">Source Language</label>
            <select
              id="sourceLanguage"
              name="sourceLanguage"
              className="form-control"
              value={novel.sourceLanguage}
              onChange={handleInputChange}
              required
            >
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetLanguage">Target Language</label>
            <select
              id="targetLanguage"
              name="targetLanguage"
              className="form-control"
              value={novel.targetLanguage}
              onChange={handleInputChange}
              required
            >
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={novel.description || ''}
              onChange={handleInputChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image URL</label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              className="form-control"
              value={novel.coverImage || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {novel.coverImage && (
              <div className="image-preview">
                <img src={novel.coverImage} alt="Cover preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isNewNovel ? 'Create Novel' : 'Update Novel'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(isNewNovel ? '/novels' : `/novels/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovelEdit;
