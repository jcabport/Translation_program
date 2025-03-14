// translationService.js

const { Anthropic } = require('@anthropic-ai/sdk');

class TranslationService {
  constructor(apiKey, nameManager, db) {
    this.anthropic = new Anthropic({ apiKey });
    this.nameManager = nameManager;
    this.db = db;
    this.model = 'claude-3-7-sonnet-20250219'; // Using the latest model
  }

  // Process a single chapter
  async translateChapter(novelId, chapterId, sourceText, sourceLanguage = 'ko', targetLanguage = 'en') {
    // 1. Load context from previous chapters
    const context = await this.getTranslationContext(novelId, chapterId);
    
    // 2. Load name dictionary
    await this.nameManager.loadDictionary(novelId);
    
    // 3. Detect new names before translation
    const newNames = await this.nameManager.detectNames(sourceText, novelId, sourceLanguage);
    
    // 4. If there are new names, we'll need to handle them later
    if (newNames.length > 0) {
      await this.db.storeDetectedNames(novelId, chapterId, newNames);
    }
    
    // 5. Prepare the translation prompt with context
    const translationPrompt = this.buildTranslationPrompt(
      sourceText,
      context,
      sourceLanguage,
      targetLanguage
    );
    
    // 6. Call Claude API for translation
    const translation = await this.callTranslationAPI(translationPrompt);
    
    // 7. Post-process the translation (ensuring name consistency)
    const processedTranslation = this.nameManager.applyNameDictionary(translation);
    
    // 8. Store the translation
    await this.db.storeTranslation(novelId, chapterId, {
      sourceText,
      rawTranslation: translation,
      processedTranslation,
      pendingNames: newNames.length > 0,
      createdAt: new Date()
    });
    
    // 9. Return the processed translation and information about new names
    return {
      translation: processedTranslation,
      newNames,
      needsReview: newNames.length > 0
    };
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
        ${context.keyTerms.map(term => `${term.original} → ${term.translated}`).join('\n')}
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
    // Get previous chapter summaries and key terms
    const previousChapters = await this.db.getPreviousChapters(novelId, chapterId, 3); // Get last 3 chapters
    
    // Create a summary from previous chapters
    let summary = "";
    if (previousChapters.length > 0) {
      summary = previousChapters.map(chapter => 
        `Chapter ${chapter.number}: ${chapter.summary || 'No summary available'}`
      ).join('\n\n');
    }
    
    // Get all key terms used so far
    const keyTerms = await this.db.getKeyTerms(novelId);
    
    return {
      summary,
      keyTerms
    };
  }
  
  // Generate a summary of a translated chapter for future context
  async generateChapterSummary(novelId, chapterId, translatedText) {
    const prompt = `
      The following is a translated chapter from a novel. 
      Please provide a concise summary (max 200 words) that captures the key plot points, 
      character developments, and important events. This summary will be used to provide 
      context for translating future chapters.
      
      Chapter:
      ${translatedText.substring(0, 3000)} // Limit text size for API call
    `;
    
    try {
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
      
      const summary = response.content[0].text;
      
      // Store the summary
      await this.db.storeChapterSummary(novelId, chapterId, summary);
      
      return summary;
    } catch (error) {
      console.error("Error generating chapter summary:", error);
      return null;
    }
  }
}

module.exports = TranslationService;
