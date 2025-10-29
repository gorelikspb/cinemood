import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MovieDiary } from './pages/MovieDiary';
import { AddMovie } from './pages/AddMovie';
import { MovieDetails } from './pages/MovieDetails';
import { TMDBMovieView } from './pages/TMDBMovieView';
import { Watchlist } from './pages/Watchlist';
import { Statistics } from './pages/Statistics';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diary" element={<MovieDiary />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/movie-tmdb/:tmdbId" element={<TMDBMovieView />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </LanguageProvider>
  );
}

export default App;

