import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import SubmitApplication from './pages/SubmitApplication';
import CheckStatus from './pages/CheckStatus';
import StaffDashboard from './pages/StaffDashboard';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitApplication />} />
            <Route path="/status" element={<CheckStatus />} />
            <Route path="/staff" element={<StaffDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;