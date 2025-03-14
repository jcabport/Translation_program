const { Anthropic } = require('@anthropic-ai/sdk');
const { Chapter, NameMapping } = require('../models');

class TranslationService {
  constructor(apiKey, nameManager) {
    if (!apiKey) {
      console.warn('TranslationService initialized without API key. Translation features will be disabled.');
      this.anthropic = null;
    } else {
      this.anthropic = new Anthropic({ apiKey });
    }
    this.nameManager = nameManager;
    this.model = 'claude-3-7-sonnet-20250219'; // Using the latest model
  }

  // Process a single chapter
  async translateChapter(novelId, chapterId, sourceText, sourceLanguage = 'ko', targetLanguage = 'en') {
    try {
      if (!this.anthropic) {
        throw new Error('Translation service is not available. Please configure the CLAUDE_API_KEY environment variable.');
      }

      // 1. Load context from previous chapters
      const context = await this.getTranslationContext(novelId, chapterId);
      
      // 2. Load name dictionary
      await this.nameManager.loadDictionary(novelId);
      
      // 3. Detect new names before translation
      const newNames = await this.nameManager.detectNames(sourceText, novelId, sourceLanguage);
      
      // 4. Prepare the translation prompt with context
      const translationPrompt = this.buildTranslationPrompt(
        sourceText,
        context,
        sourceLanguage,
        targetLanguage
      );
      
      // 5. Call Claude API for translation
      const rawTranslation = await this.callTranslationAPI(translationPrompt);
      
      // 6. Post-process the translation (ensuring name consistency)
      const processedTranslation = this.nameManager.applyNameDictionary(rawTranslation);
      
      // 7. Return the processed translation and information about new names
      return {
        rawTranslation,
        processedTranslation,
        newNames,
      };
    } catch (error) {
      console.error('Error translating chapter:', error);
      throw error;
    }
  }

  // Build a prompt for Claude that includes necessary context
  buildTranslationPrompt(sourceText, context, sourceLanguage, targetLanguage) {
    const languageNames = {
      ko: 'Korean',
      ja: 'Japanese',
      en: 'English',
      // Add more as needed
    };
    
    return `
      <context>
        ${context.summary || ""}
        
        Key terms and names used in previous chapters:
        ${context.keyTerms.map(term => `${term.originalName} → ${term.translatedName}`).join('\n')}
      </context>
      
      You are translating a ${languageNames[sourceLanguage]} novel to ${languageNames[targetLanguage]}.
      Please translate the following chapter naturally, maintaining the original tone, style, and meaning.
      
      Important guidelines:
      1. Preserve character names as they appear in the source text
      2. Maintain honorifics (like -san, -nim) but with English notation
      3. Keep cultural references intact, with brief explanations in [square brackets] only if necessary
      4. Preserve paragraph breaks
      5. Translate dialogue naturally, focusing on how an English speaker would express the same idea
      
      Chapter to translate:
      ${sourceText}
    `;
  }

  // Call Claude API for translation
  async callTranslationAPI(prompt) {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API:", error);
      throw new Error("Translation failed: " + error.message);
    }
  }

  // Get context from previous chapters to maintain consistency
  async getTranslationContext(novelId, chapterId) {
    try {
      // Get previous chapter summaries
      const previousChapters = await Chapter.find({
        novel: novelId,
        _id: { $ne: chapterId },
        summary: { $exists: true, $ne: null }
      })
      .sort({ number: -1 })
      .limit(3); // Get last 3 chapters
      
      // Create a summary from previous chapters
      let summary = "";
      if (previousChapters.length > 0) {
        summary = previousChapters.map(chapter => 
          `Chapter ${chapter.number}: ${chapter.summary || 'No summary available'}`
        ).join('\n\n');
      }
      
      // Get all key terms used so far
      const keyTerms = await NameMapping.find({ novel: novelId });
      
      return {
        summary,
        keyTerms
      };
    } catch (error) {
      console.error('Error getting translation context:', error);
      // Return empty context in case of error
      return {
        summary: '',
        keyTerms: []
      };
    }
  }
  
  // Generate a summary of a translated chapter for future context
  async generateChapterSummary(novelId, chapterId, translatedText) {
    try {
      const prompt = `
        The following is a translated chapter from a novel. 
        Please provide a concise summary (max 200 words) that captures the key plot points, 
        character developments, and important events. This summary will be used to provide 
        context for translating future chapters.
        
        Chapter:
        ${translatedText.substring(0, 3000)} // Limit text size for API call
      `;
      
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error("Error generating chapter summary:", error);
      return null;
    }
  }
}

module.exports = TranslationService;
