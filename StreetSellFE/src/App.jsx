import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import MyFooter from './Components/MyFooter';
import MyNavbar from './Components/MyNavbar';
import HomePage from './Components/HomePage';
import RegisterPage from './Components/RegisterPage';
import CreaProductPage from './Components/CreaProducts';
import Home from './Components/Home';
import Details from './Components/Details';
import ProfilePage from './Components/ProfilePage';
import ProfileProductPage from './Components/ProfileProductPage';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setUser, logout } from './Redux/Action';
import AdminDashboard from './Components/AdminDashboard';
import AdminRoute from './Components/AdminRoute';

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');

  // Leggiamo se l'utente è autenticato da Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Logica per mantenere il login al ricaricamento della pagina
  useEffect(() => {
    if (token) {
      fetch('http://localhost:8888/utenti/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Token non valido');
          return res.json();
        })
        .then((userResponse) => {
          dispatch(setUser(userResponse));
        })
        .catch((error) => {
          console.error('Errore nel recupero utente:', error);
          localStorage.removeItem('accessToken');
          dispatch(logout());
        });
    }
  }, [dispatch, token]);
  return (
    <BrowserRouter>
      <div className='d-flex flex-column min-vh-100'>
        <MyNavbar />
        <div className='flex-grow-1'>
          <Routes>
            {/* 1. LOGICA HOME CONDIZIONALE: Mostra Home se loggato, HomePage se logout */}
            <Route
              path='/'
              element={isAuthenticated ? <Home /> : <HomePage />}
            />

            {/* 2. AUTH */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<RegisterPage />} />

            <Route
              path='/admin/dashboard'
              // Usiamo AdminRoute per applicare il controllo del ruolo
              element={<AdminRoute element={AdminDashboard} />}
            />

            {/* 3. PRODOTTI (Creazione e Modifica) */}
            <Route path='/crea-prodotto' element={<CreaProductPage />} />
            <Route
              path='/modifica-prodotto/:id'
              element={<CreaProductPage />}
            />

            {/* 4. DETTAGLIO (Corretto al PLURALE per matchare i link) */}
            <Route path='/prodotto/:prodottoId' element={<Details />} />

            {/* 5. PROFILO UTENTE */}
            <Route path='/prodotti/me' element={<ProfileProductPage />} />
            <Route path='/me' element={<ProfilePage />} />
          </Routes>
        </div>
        <MyFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
