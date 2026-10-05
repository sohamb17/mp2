import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { CharactersProvider } from './context/CharactersProvider'
import { DetailView } from './pages/DetailView'
import { GalleryView } from './pages/GalleryView'
import { ListView } from './pages/ListView'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CharactersProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ListView />} />
            <Route path="gallery" element={<GalleryView />} />
            <Route path="character/:id" element={<DetailView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CharactersProvider>
    </BrowserRouter>
  )
}
