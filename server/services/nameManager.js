const { NameMapping } = require('../models');
const { Anthropic } = require('@anthropic-ai/sdk');

class NameManager {
  constructor(apiKey) {
    this.nameCache = new Map(); // In-memory cache of name mappings
    if (!apiKey) {
      throw new Error('Claude API key is required for NameManager');
    }
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  // Load name dictionary for a specific novel
  async loadDictionary(novelId) {
    try {
      const dictionary = await NameMapping.find({ novel: novelId });
      this.nameCache.clear();
      
      dictionary.forEach(entry => {
        this.nameCache.set(entry.originalName, entry.translatedName);
      });
      
      return dictionary;
    } catch (error) {
      console.error('Error loading name dictionary:', error);
      throw error;
    }
  }

  // Detect potential new names in text
  async detectNames(text, novelId, language = 'ko') {
    try {
      // Get existing dictionary
      await this.loadDictionary(novelId);
      
      // Use Claude API to help identify potential names
      const prompt = `
        The following is text from a ${language === 'ko' ? 'Korean' : 'Japanese'} novel.
        Please identify all proper nouns (character names, location names, special terms) that appear in this text.
        Return them as a JSON array of objects with the originalText, the type of name (character, location, etc.),
        and your best phonetic translation to English.
        
        Example format:
        [
          {
            "originalText": "김철수",
            "type": "character",
            "suggestedTranslation": "Kim Cheol-su"
          },
          {
            "originalText": "서울",
            "type": "location",
            "suggestedTranslation": "Seoul"
          }
        ]
        
        Text: ${text.substring(0, 2000)} // Limit text size for API call
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      let potentialNames = [];
      
      try {
        // Extract JSON from response
        const responseText = response.content[0].text;
        const jsonMatch = responseText.match(/\\[\\s\\S]*?\\]/);
        
        if (jsonMatch) {
          potentialNames = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to regex-based detection
          potentialNames = this.regexNameDetection(text, language);
        }
      } catch (e) {
        console.error("Failed to parse Claude API response", e);
        // Fallback to regex-based detection
        potentialNames = this.regexNameDetection(text, language);
      }
      
      // Filter out names that are already in our dictionary
      return potentialNames.filter(name => !this.nameCache.has(name.originalText));
    } catch (error) {
      console.error('Error detecting names:', error);
      // Fallback to regex-based detection
      return this.regexNameDetection(text, language);
    }
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
    try {
      const nameMapping = await NameMapping.create({
        novel: novelId,
        originalName,
        translatedName,
        type,
        firstDetected: new Date(),
        frequency: 1
      });
      
      this.nameCache.set(originalName, translatedName);
      return nameMapping;
    } catch (error) {
      console.error('Error adding name mapping:', error);
      throw error;
    }
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
      const regex = new RegExp(this.escapeRegExp(originalName), 'g');
      processedText = processedText.replace(regex, translatedName);
    }
    
    return processedText;
  }

  // Helper function to escape regex special characters
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = NameManager;
