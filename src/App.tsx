import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import HomeLayout from './layouts/HomeLayout';
import Home from './pages/HomePage';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import React from 'react';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomeLayout/>}/>
      <Route index element={<Home/>}/>
      <Route path="/sendfeedback" element={<Feedback/>}/>
      <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
