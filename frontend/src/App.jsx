import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SearchResults from './pages/SearchResults'
import PropertyDetail from './pages/PropertyDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/properties" element={<SearchResults />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App