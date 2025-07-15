// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import home from './pages/home'
import showroom from './pages/showroom'
import admin from './pages/admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/showroom" element={<Showroom />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
