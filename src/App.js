import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Stats from './pages/Stats';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import Finance from './pages/Finance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="stats" element={<Stats />} />
            <Route path="finance" element={<Finance />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
