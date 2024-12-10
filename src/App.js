import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import HomeLayout from './layouts/HomeLayout';
import Home from './pages/Home';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomeLayout/>}>
      <Route index element={<Home/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
