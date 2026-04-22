import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import HomePage from './home/HomePage';
import NavMenu from './shared/NavMenu';
import AdminPage from './admin/AdminPage';
import SupportPage from './support/SupportPage';
 
 
function App() {
  return (
   
      <Container>
        <Router>
          <NavMenu />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="/AdminPage" element={<AdminPage />} />
                  <Route path="/SupportPage" element={<SupportPage />} />
                </Routes>
        </Router>
      </Container>
   
  );
}
 
export default App;
 
 