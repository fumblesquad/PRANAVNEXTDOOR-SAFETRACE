import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SOS from './pages/SOS';
import MainApp from './pages/MainApp';
import SignIn from './pages/SignIn';
import Track from './pages/Track';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* SOS screen — landing */}
          <Route path="/" element={<SOS />} />

          {/* Main tabbed app */}
          <Route path="/home" element={<MainApp />} />

          {/* Standalone sign in */}
          <Route path="/signin" element={<SignIn />} />

          {/* Standalone case tracker */}
          <Route path="/track" element={<Track />} />

          {/* Fallback to SOS */}
          <Route path="*" element={<SOS />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
