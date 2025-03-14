# Novel Translation Website

A web application for translating Korean and Japanese novels to English using Claude 3.7 AI, with a focus on maintaining consistency in character names and terminology across chapters.

## Features

- **High-Quality Translation**: Powered by Claude 3.7 for natural-sounding translations
- **Name Consistency**: Detects character names, locations, and special terms, allowing users to choose consistent translations
- **Chapter Management**: Upload, organize, and translate chapters with automatic context preservation
- **Context Preservation**: Maintains context between chapters for consistent translation

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB
- Claude 3.7 API

### Frontend
- React
- React Router
- CSS

## Project Structure

```
novel-translation/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── services/       # API client services
│       └── utils/          # Helper functions
│
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   ├── translationService.js  # Translation service
│   │   └── nameManager.js  # Name management service
│   └── utils/              # Helper functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Claude API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/novel-translation.git
   cd novel-translation
   ```

2. Install dependencies
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the server directory
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/novel-translation
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. Start the development servers
   ```
   # Start the backend server
   cd server
   npm run dev

   # In a separate terminal, start the frontend
   cd client
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Create a Novel**: Add a new novel with title, author, and source language
2. **Add Chapters**: Upload chapters in the original language
3. **Translate**: Translate chapters with a single click
4. **Review Names**: Choose how character names and special terms should be translated
5. **Read**: Enjoy your translated novel

## API Endpoints

### Novels
- `GET /api/novels` - Get all novels
- `POST /api/novels` - Create a new novel
- `GET /api/novels/:id` - Get a novel by ID
- `PUT /api/novels/:id` - Update a novel
- `DELETE /api/novels/:id` - Delete a novel

### Chapters
- `GET /api/novels/:novelId/chapters` - Get all chapters for a novel
- `POST /api/novels/:novelId/chapters` - Create a new chapter
- `GET /api/chapters/:id` - Get a chapter by ID
- `PUT /api/chapters/:id` - Update a chapter
- `DELETE /api/chapters/:id` - Delete a chapter

### Translation
- `POST /api/novels/:novelId/chapters/:chapterId/translate` - Translate a chapter

### Name Management
- `GET /api/novels/:novelId/names` - Get all name mappings for a novel
- `POST /api/novels/:novelId/names` - Create a new name mapping
- `PUT /api/names/:id` - Update a name mapping
- `DELETE /api/names/:id` - Delete a name mapping
- `GET /api/novels/:novelId/chapters/:chapterId/detected-names` - Get detected names for a chapter
- `PUT /api/novels/:novelId/chapters/:chapterId/resolve-names` - Resolve detected names

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Setup

1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables in your `.env` file:
   - `MONGO_URI`: MongoDB connection string (default: mongodb://localhost:27017/novel-translation)
   - `PORT`: Server port (default: 5001)
   - `NODE_ENV`: Environment mode (development/production)
   - `CLAUDE_API_KEY`: Your Claude API key (required for translation features)

3. If you don't have a Claude API key:
   - The application will still work for basic features (viewing novels, chapters)
   - Translation features will be disabled
   - Name detection will fall back to basic regex-based detection

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the backend server and frontend development server.
