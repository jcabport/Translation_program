import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { chapterApi, translationApi } from '../services/api';
import NameResolutionDialog from '../components/translation/NameResolutionDialog';
import './TranslationPage.css';

const TranslationPage = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectedNames, setDetectedNames] = useState([]);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const chapterData = await chapterApi.getChapter(chapterId);
        
        // If chapter is already translated, redirect to chapter view
        if (chapterData.status !== 'pending') {
          navigate(`/novels/${novelId}/chapters/${chapterId}`);
          return;
        }
        
        setChapter(chapterData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch chapter. Please try again later.');
        console.error('Error fetching chapter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [novelId, chapterId, navigate]);

  const handleTranslate = async () => {
    try {
      setTranslating(true);
      const result = await translationApi.translateChapter(novelId, chapterId);
      
      setTranslationResult(result);
      
      // Update chapter with translation
      setChapter({
        ...chapter,
        translation: {
          processed: result.translation,
        },
        status: result.needsReview ? 'needs_review' : 'translated',
        pendingNames: result.needsReview,
      });
      
      // If new names were detected, show the dialog
      if (result.newNames && result.newNames.length > 0) {
        setDetectedNames(result.newNames);
        setShowNameDialog(true);
      } else {
        // If no names to resolve, redirect to chapter view
        setTimeout(() => {
          navigate(`/novels/${novelId}/chapters/${chapterId}`);
        }, 2000);
      }
      
      setError(null);
    } catch (err) {
      setError('Translation failed. Please try again later.');
      console.error('Error translating chapter:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleResolveNames = async (resolvedNames) => {
    try {
      setLoading(true);
      await translationApi.resolveNames(novelId, chapterId, resolvedNames);
      
      // Redirect to chapter view
      navigate(`/novels/${novelId}/chapters/${chapterId}`);
      
      setError(null);
    } catch (err) {
      setError('Failed to resolve names. Please try again later.');
      console.error('Error resolving names:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNameResolution = () => {
    // Redirect to chapter view even if names are not resolved
    navigate(`/novels/${novelId}/chapters/${chapterId}`);
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
    <div className="translation-page">
      <div className="page-header">
        <div className="page-title">
          <Link to={`/novels/${novelId}`} className="back-link">
            &larr; Back to Novel
          </Link>
          <h1>
            Translate Chapter {chapter.number}: {chapter.title}
          </h1>
        </div>
      </div>

      <div className="translation-container">
        <div className="source-content card">
          <h2>Original Text</h2>
          <div className="content-preview">
            {chapter.sourceText.split('\n').slice(0, 3).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {chapter.sourceText.split('\n').length > 3 && (
              <p className="preview-ellipsis">...</p>
            )}
          </div>
          <div className="content-stats">
            <p>
              <strong>Language:</strong>{' '}
              {chapter.novel?.sourceLanguage === 'ko' ? 'Korean' : 'Japanese'}
            </p>
            <p>
              <strong>Characters:</strong> {chapter.sourceText.length}
            </p>
            <p>
              <strong>Paragraphs:</strong> {chapter.sourceText.split('\n').length}
            </p>
          </div>
        </div>

        <div className="translation-actions">
          {!translationResult ? (
            <div className="translation-start">
              <p>
                Ready to translate this chapter using Claude 3.7 AI. The translation will maintain the
                original tone, style, and meaning while ensuring natural-sounding English.
              </p>
              <button
                onClick={handleTranslate}
                className="btn btn-primary"
                disabled={translating}
              >
                {translating ? 'Translating...' : 'Start Translation'}
              </button>
            </div>
          ) : (
            <div className="translation-complete">
              <div className="success-icon">✓</div>
              <h2>Translation Complete!</h2>
              {translationResult.newNames && translationResult.newNames.length > 0 ? (
                <p>
                  New names detected. Please review and choose translations for these names to
                  ensure consistency throughout the novel.
                </p>
              ) : (
                <p>
                  Translation completed successfully. You will be redirected to the chapter view.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {translating && (
        <div className="translation-progress">
          <div className="progress-spinner"></div>
          <p>Translating chapter... This may take a minute.</p>
        </div>
      )}

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

export default TranslationPage;
