import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Report from './pages/Report';
import FullMap from './pages/Map';
import Track from './pages/Track';
import EvidenceLocker from './pages/EvidenceLocker';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/map" element={<FullMap />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/track" element={<Track />} />
                  <Route path="/evidence-locker" element={<EvidenceLocker />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
