import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { novelApi, chapterApi } from '../services/api';
import './NovelDetail.css';

const NovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    number: '',
    title: '',
    sourceText: '',
  });

  useEffect(() => {
    const fetchNovelAndChapters = async () => {
      try {
        setLoading(true);
        
        // Special case for "new" route
        if (id === 'new') {
          setNovel({
            title: 'New Novel',
            author: '',
            sourceLanguage: 'ko',
            targetLanguage: 'en',
            description: '',
            coverImage: '',
            chapters: []
          });
          setChapters([]);
        } else {
          const novelData = await novelApi.getNovel(id);
          setNovel(novelData);
          
          const chaptersData = await chapterApi.getChapters(id);
          setChapters(chaptersData);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch novel details. Please try again later.');
        console.error('Error fetching novel details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovelAndChapters();
  }, [id]);

  const handleDeleteNovel = async () => {
    if (window.confirm('Are you sure you want to delete this novel? This action cannot be undone.')) {
      try {
        await novelApi.deleteNovel(id);
        navigate('/novels');
      } catch (err) {
        setError('Failed to delete novel. Please try again later.');
        console.error('Error deleting novel:', err);
      }
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      try {
        await chapterApi.deleteChapter(chapterId);
        setChapters(chapters.filter(chapter => chapter._id !== chapterId));
      } catch (err) {
        setError('Failed to delete chapter. Please try again later.');
        console.error('Error deleting chapter:', err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChapter({
      ...newChapter,
      [name]: value,
    });
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    
    try {
      const chapterData = {
        ...newChapter,
        number: parseInt(newChapter.number),
      };
      
      const createdChapter = await chapterApi.createChapter(id, chapterData);
      setChapters([...chapters, createdChapter]);
      setNewChapter({
        number: '',
        title: '',
        sourceText: '',
      });
      setShowAddChapter(false);
    } catch (err) {
      setError('Failed to add chapter. Please try again later.');
      console.error('Error adding chapter:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading novel details...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!novel) {
    return <div className="alert alert-error">Novel not found.</div>;
  }

  return (
    <div className="novel-detail-page">
      <div className="page-header">
        <div className="page-title">
          <h1>{novel.title}</h1>
          <p className="novel-author">by {novel.author}</p>
        </div>
        <div className="page-actions">
          {id !== 'new' && (
            <>
              <button onClick={() => navigate(`/novels/${id}/edit`)} className="btn btn-secondary">
                Edit Novel
              </button>
              <button onClick={handleDeleteNovel} className="btn btn-secondary">
                Delete Novel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="novel-info-card">
        <div className="novel-cover">
          {novel.coverImage ? (
            <img src={novel.coverImage} alt={novel.title} />
          ) : (
            <div className="novel-cover-placeholder">
              <span>{novel.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="novel-details">
          <p className="novel-language">
            <strong>Language:</strong> {novel.sourceLanguage === 'ko' ? 'Korean' : 'Japanese'} → English
          </p>
          {novel.description && (
            <div className="novel-description">
              <strong>Description:</strong>
              <p>{novel.description}</p>
            </div>
          )}
          <p className="novel-chapters-count">
            <strong>Chapters:</strong> {chapters.length}
          </p>
        </div>
      </div>

      <div className="chapters-section">
        <div className="section-header">
          <h2>Chapters</h2>
          <button
            onClick={() => setShowAddChapter(!showAddChapter)}
            className="btn btn-primary"
          >
            {showAddChapter ? 'Cancel' : 'Add Chapter'}
          </button>
        </div>

        {showAddChapter && (
          <div className="add-chapter-form card">
            <h3>Add New Chapter</h3>
            <form onSubmit={handleAddChapter}>
              <div className="form-group">
                <label htmlFor="number">Chapter Number</label>
                <input
                  type="number"
                  id="number"
                  name="number"
                  className="form-control"
                  value={newChapter.number}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Chapter Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={newChapter.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sourceText">Source Text</label>
                <textarea
                  id="sourceText"
                  name="sourceText"
                  className="form-control"
                  value={newChapter.sourceText}
                  onChange={handleInputChange}
                  required
                  rows="10"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        )}

        {chapters.length === 0 ? (
          <div className="empty-state">
            <p>No chapters yet. Add your first chapter to get started!</p>
          </div>
        ) : (
          <div className="chapters-list">
            {chapters
              .sort((a, b) => a.number - b.number)
              .map((chapter) => (
                <div key={chapter._id} className="chapter-card">
                  <div className="chapter-info">
                    <h3 className="chapter-title">
                      Chapter {chapter.number}: {chapter.title}
                    </h3>
                    <div className="chapter-status">
                      <span className={`status-badge status-${chapter.status}`}>
                        {chapter.status === 'pending'
                          ? 'Not Translated'
                          : chapter.status === 'translated'
                          ? 'Translated'
                          : chapter.status === 'needs_review'
                          ? 'Needs Review'
                          : 'Completed'}
                      </span>
                      {chapter.pendingNames && (
                        <span className="status-badge status-warning">Names Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="chapter-actions">
                    <Link
                      to={`/novels/${id}/chapters/${chapter._id}`}
                      className="btn btn-primary"
                    >
                      View
                    </Link>
                    {chapter.status === 'pending' && (
                      <Link
                        to={`/novels/${id}/chapters/${chapter._id}/translate`}
                        className="btn btn-secondary"
                      >
                        Translate
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteChapter(chapter._id)}
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
    </div>
  );
};

export default NovelDetail;
