import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import NovelList from './pages/NovelList';
import NovelDetail from './pages/NovelDetail';
import NovelEdit from './pages/NovelEdit';
import ChapterView from './pages/ChapterView';
import TranslationPage from './pages/TranslationPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novels" element={<NovelList />} />
          <Route path="/novels/new" element={<NovelEdit />} />
          <Route path="/novels/:id/edit" element={<NovelEdit />} />
          <Route path="/novels/:id" element={<NovelDetail />} />
          <Route path="/novels/:novelId/chapters/:chapterId" element={<ChapterView />} />
          <Route path="/novels/:novelId/chapters/:chapterId/translate" element={<TranslationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
