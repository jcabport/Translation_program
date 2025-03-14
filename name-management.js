// nameManagementService.js

// Helper class to manage name translations and consistency
class NameManager {
  constructor(db) {
    this.db = db;
    this.nameCache = new Map(); // In-memory cache of name mappings
  }

  // Load name dictionary for a specific novel
  async loadDictionary(novelId) {
    const dictionary = await this.db.getNameDictionary(novelId);
    this.nameCache.clear();
    
    dictionary.forEach(entry => {
      this.nameCache.set(entry.originalName, entry.translatedName);
    });
    
    return dictionary;
  }

  // Detect potential new names in text
  async detectNames(text, novelId, language = 'ko') {
    // Get existing dictionary
    await this.loadDictionary(novelId);
    
    // Use Claude API to help identify potential names
    const prompt = `
      The following is text from a ${language === 'ko' ? 'Korean' : 'Japanese'} novel.
      Please identify all proper nouns (character names, location names, special terms) that appear in this text.
      Return them as a JSON array of objects with the original text, the type of name (character, location, etc.),
      and your best phonetic translation to English.
      Text: ${text.substring(0, 2000)} // Limit text size for API call
    `;

    const response = await callClaudeAPI(prompt);
    let potentialNames = [];
    
    try {
      potentialNames = JSON.parse(response);
    } catch (e) {
      console.error("Failed to parse Claude API response", e);
      // Fallback to regex-based detection
      potentialNames = this.regexNameDetection(text, language);
    }
    
    // Filter out names that are already in our dictionary
    return potentialNames.filter(name => !this.nameCache.has(name.originalText));
  }

  // Regex-based name detection as fallback
  regexNameDetection(text, language) {
    let patterns = [];
    
    if (language === 'ko') {
      // Korean name patterns (simplified)
      patterns = [
        /([가-힣]{1,2})\s?([가-힣]{1,2})(씨|님|군|양|장군|선생|박사|교수|부장|과장)/g, // Names with titles
        /([가-힣]{1,2})\s([가-힣]{1,2})/g // Simple two-syllable names
      ];
    } else {
      // Japanese name patterns (simplified)
      patterns = [
        /([一-龯ぁ-んァ-ン]{1,2})\s?([一-龯ぁ-んァ-ン]{1,2})(さん|くん|ちゃん|先生|様|殿|氏)/g, // Names with honorifics
        /([一-龯ぁ-んァ-ン]{1,2})\s([一-龯ぁ-んァ-ン]{1,2})/g // Simple names
      ];
    }
    
    const potentialNames = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        potentialNames.push({
          originalText: match[0],
          type: 'unknown', // We can't determine type from regex
          suggestedTranslation: '' // No suggestion for regex matches
        });
      }
    });
    
    return potentialNames;
  }

  // Add a new name mapping
  async addNameMapping(novelId, originalName, translatedName, type) {
    await this.db.addNameMapping(novelId, {
      originalName,
      translatedName,
      type,
      firstDetected: new Date(),
      frequency: 1
    });
    
    this.nameCache.set(originalName, translatedName);
  }

  // Apply name dictionary to translated text
  applyNameDictionary(translatedText) {
    let processedText = translatedText;
    
    // Sort by length (longest first) to prevent partial replacements
    const sortedEntries = [...this.nameCache.entries()]
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [originalName, translatedName] of sortedEntries) {
      // We need a more sophisticated replacement strategy here
      // This is simplified for demonstration
      const regex = new RegExp(escapeRegExp(originalName), 'g');
      processedText = processedText.replace(regex, translatedName);
    }
    
    return processedText;
  }
}

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export the service
module.exports = NameManager;
