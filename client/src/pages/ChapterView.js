import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { chapterApi, translationApi, nameApi } from '../services/api';
import NameResolutionDialog from '../components/translation/NameResolutionDialog';
import './ChapterView.css';

const ChapterView = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectedNames, setDetectedNames] = useState([]);
  const [showNameDialog, setShowNameDialog] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const chapterData = await chapterApi.getChapter(chapterId);
        setChapter(chapterData);
        
        // If chapter has pending names, fetch them
        if (chapterData.pendingNames) {
          const names = await translationApi.getDetectedNames(novelId, chapterId);
          setDetectedNames(names);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch chapter. Please try again later.');
        console.error('Error fetching chapter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [novelId, chapterId]);

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const result = await translationApi.translateChapter(novelId, chapterId);
      
      // Update chapter with translation
      setChapter({
        ...chapter,
        translation: {
          ...chapter.translation,
          processed: result.translation,
        },
        status: result.needsReview ? 'needs_review' : 'translated',
        pendingNames: result.needsReview,
      });
      
      // If new names were detected, show the dialog
      if (result.newNames && result.newNames.length > 0) {
        setDetectedNames(result.newNames);
        setShowNameDialog(true);
      }
      
      setError(null);
    } catch (err) {
      setError('Translation failed. Please try again later.');
      console.error('Error translating chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveNames = async (resolvedNames) => {
    try {
      setLoading(true);
      await translationApi.resolveNames(novelId, chapterId, resolvedNames);
      
      // Update chapter status
      setChapter({
        ...chapter,
        pendingNames: false,
        status: 'translated',
      });
      
      setShowNameDialog(false);
      setDetectedNames([]);
      setError(null);
    } catch (err) {
      setError('Failed to resolve names. Please try again later.');
      console.error('Error resolving names:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNameResolution = () => {
    setShowNameDialog(false);
  };

  if (loading && !chapter) {
    return <div className="loading">Loading chapter...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!chapter) {
    return <div className="alert alert-error">Chapter not found.</div>;
  }

  return (
    <div className="chapter-view-page">
      <div className="page-header">
        <div className="page-title">
          <Link to={`/novels/${novelId}`} className="back-link">
            &larr; Back to Novel
          </Link>
          <h1>
            Chapter {chapter.number}: {chapter.title}
          </h1>
        </div>
        <div className="page-actions">
          {chapter.status === 'pending' ? (
            <button onClick={handleTranslate} className="btn btn-primary">
              Translate
            </button>
          ) : chapter.pendingNames ? (
            <button onClick={() => setShowNameDialog(true)} className="btn btn-primary">
              Resolve Names
            </button>
          ) : null}
        </div>
      </div>

      <div className="chapter-status-bar">
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

      <div className="chapter-content-container">
        <div className="chapter-content-columns">
          <div className="source-content">
            <h2>Original Text</h2>
            <div className="content-box">
              {chapter.sourceText.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="translated-content">
            <h2>Translated Text</h2>
            <div className="content-box">
              {chapter.status === 'pending' ? (
                <div className="not-translated">
                  <p>This chapter has not been translated yet.</p>
                  <button onClick={handleTranslate} className="btn btn-primary">
                    Translate Now
                  </button>
                </div>
              ) : chapter.translation && chapter.translation.processed ? (
                chapter.translation.processed.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <div className="not-translated">
                  <p>Translation not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNameDialog && (
        <NameResolutionDialog
          names={detectedNames}
          onResolved={handleResolveNames}
          onCancel={handleCancelNameResolution}
        />
      )}
    </div>
  );
};

export default ChapterView;
