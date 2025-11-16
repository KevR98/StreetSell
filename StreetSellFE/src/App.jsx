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

function App() {
  return (
    <>
      <BrowserRouter>
        <div className='d-flex flex-column min-vh-100'>
          <MyNavbar />
          <div className='flex-grow-1'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/' element={<HomePage />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/crea-prodotto' element={<CreaProductPage />} />
              <Route path='/prodotto/:prodottoId' element={<Details />} />
            </Routes>
          </div>
          <MyFooter />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
