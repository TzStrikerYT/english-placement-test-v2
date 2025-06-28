import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Exam from './pages/Exam';
import Report from './pages/Report';
import Survey from './pages/Survey';
import Reporting from './pages/Reporting';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/report" element={<Report />} />
        <Route path="/reporting" element={
          <ProtectedRoute>
            <Reporting />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
