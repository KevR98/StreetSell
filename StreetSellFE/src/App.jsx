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
import ProfileProductPage from './Components/ProfileProductPage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from './Redux/Action';

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');
  useEffect(() => {
    // Logica di ricarica dell'utente... (lasciata intatta)
    if (token) {
      fetch('http://localhost:8888/utenti/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        // ... logica omessa ...
        .catch((error) => {
          console.error('Errore nel recupero utente:', error);
          localStorage.removeItem('accessToken');
          dispatch(logout());
        });
    }
  }, [dispatch, token]);

  return (
    <>
      <BrowserRouter>
        <div className='d-flex flex-column min-vh-100'>
          <MyNavbar />
          <div className='flex-grow-1'>
            <Routes>
              {/* 🛑 DEVI USARE QUI UN REDIRECT COMPONENT PER LA LOGICA CONDIZIONALE */}
              <Route path='/' element={token ? <HomePage /> : <Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/crea-prodotto' element={<CreaProductPage />} />
              <Route path='/prodotto/:prodottoId' element={<Details />} />
              <Route path='/prodotti/me' element={<ProfileProductPage />} />
            </Routes>
          </div>
          <MyFooter />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
