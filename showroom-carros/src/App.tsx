// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Showroom from './pages/showroom'
import Admin from './pages/admin'

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

export default App;
