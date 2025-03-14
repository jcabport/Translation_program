import React, { useState } from 'react';
import './NameResolutionDialog.css';

const NameResolutionDialog = ({ names, onResolved, onCancel }) => {
  // Track user choices for each name
  const [nameChoices, setNameChoices] = useState(
    names.reduce((acc, name) => {
      acc[name._id] = {
        originalName: name.originalText,
        translatedName: name.suggestedTranslation || '',
        nameType: name.type || 'character'
      };
      return acc;
    }, {})
  );

  // Update a specific name choice
  const handleNameChange = (nameId, field, value) => {
    setNameChoices(prev => ({
      ...prev,
      [nameId]: {
        ...prev[nameId],
        [field]: value
      }
    }));
  };

  // Submit all name choices
  const handleSubmit = () => {
    const resolvedNames = Object.entries(nameChoices).map(([detectedNameId, data]) => ({
      detectedNameId,
      action: 'add',
      translatedName: data.translatedName,
      type: data.nameType
    }));
    
    onResolved(resolvedNames);
  };

  // Types of names for selection
  const nameTypes = [
    { value: 'character', label: 'Character' },
    { value: 'location', label: 'Location' },
    { value: 'organization', label: 'Organization' },
    { value: 'item', label: 'Item/Object' },
    { value: 'concept', label: 'Concept/Idea' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="name-resolution-overlay">
      <div className="name-resolution-dialog">
        <h2 className="dialog-title">New Names Detected</h2>
        
        <p className="dialog-description">
          The following new names were detected in the chapter. Please review the suggested translations
          or provide your own to ensure consistency throughout the novel.
        </p>
        
        <div className="names-container">
          {names.map(name => (
            <div key={name._id} className="name-item">
              <div className="name-grid">
                <div className="name-field">
                  <label>Original Name</label>
                  <div className="name-display">{name.originalText}</div>
                </div>
                
                <div className="name-field">
                  <label>Translation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nameChoices[name._id].translatedName}
                    onChange={(e) => handleNameChange(name._id, 'translatedName', e.target.value)}
                    placeholder="Enter translated name"
                  />
                </div>
                
                <div className="name-field">
                  <label>Context (where it appears)</label>
                  <div className="name-display context">{name.context || "No context available"}</div>
                </div>
                
                <div className="name-field">
                  <label>Name Type</label>
                  <select
                    className="form-control"
                    value={nameChoices[name._id].nameType}
                    onChange={(e) => handleNameChange(name._id, 'nameType', e.target.value)}
                  >
                    {nameTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="dialog-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Later
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            Save Name Translations
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameResolutionDialog;
