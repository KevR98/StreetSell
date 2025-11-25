import {
  Button,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
  Form,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../Redux/Action';
import logo from '../assets/streetsell-logo.png';
import avatarDefault from '../assets/streetsell-profile-pic.png'; // Rinomino per chiarezza
import {
  BsBoxArrowRight,
  BsFillTagFill,
  BsPersonFill,
  BsController,
  BsSearch,
} from 'react-icons/bs';
import Notification from './Notification';
import { FaBoxOpen } from 'react-icons/fa';
import { useState } from 'react';

const brandColor = '#fa8229';

function MyNavbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STATI PER LA RICERCA
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('prodotti');

  const token = localStorage.getItem('accessToken');

  // Recuperiamo tutto l'oggetto user per sicurezza
  const user = useSelector((state) => state.auth.user);
  const username = user?.username;
  const ruolo = user?.ruolo;

  const isLoggedInAndLoaded = token && username;
  const isAdmin = ruolo === 'ADMIN';
  const isLoadingUserData = token && !username;

  // ✅ CORREZIONE LOGICA AVATAR
  // Se l'URL è nullo, vuoto o è la stringa "default" (il nostro trucco), usa l'immagine locale
  const hasValidAvatar =
    user?.avatarUrl && user.avatarUrl !== 'default' && user.avatarUrl !== '';
  const avatarToDisplay = hasValidAvatar ? user.avatarUrl : avatarDefault;

  // ✅ CORREZIONE TITOLO DROPDOWN (SOLO FOTO)
  const dropdownTitle = (
    <div className='d-flex align-items-center justify-content-center'>
      <img
        src={avatarToDisplay}
        alt='Profilo' // Tolto username dall'alt per evitare che esca testo in caso di errore
        className='rounded-circle' // Tolto 'me-2' perché non c'è testo a fianco
        style={{
          width: '32px',
          height: '32px',
          objectFit: 'cover',
          border: '1px solid #444', // Opzionale: bordo sottile per stacco
        }}
      />
      {/* Rimosso lo span ADMIN come richiesto ("solo il profilo") */}
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  // GESTIONE INVIO RICERCA
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      navigate(`/cerca?q=${query}&type=${searchType}`);
      setQuery('');
    }
  };

  return (
    <Navbar expand='lg' className='bg-dark' data-bs-theme='dark' sticky='top'>
      <Container>
        <Link
          to='/'
          className='d-flex align-items-center text-decoration-none me-3'
        >
          <img
            src={logo}
            alt='StreetSell Logo'
            height='40'
            style={{ objectFit: 'contain', display: 'block' }}
          />
        </Link>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav>
            <Nav.Link as={Link} to='/' active={location.pathname === '/'}>
              Home
            </Nav.Link>
          </Nav>

          <Form
            className='d-flex flex-grow-1 mx-4'
            onSubmit={handleSearchSubmit}
          >
            <InputGroup>
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  maxWidth: '110px',
                  backgroundColor: '#212529',
                  color: '#f8f9fa',
                  border: '1px solid #495057',
                }}
              >
                <option value='prodotti'>Prodotti</option>
                <option value='utenti'>Utenti</option>
              </Form.Select>

              <FormControl
                type='search'
                placeholder={
                  searchType === 'prodotti'
                    ? 'Cerca un prodotto...'
                    : 'Cerca un utente...'
                }
                aria-label='Search'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Button
                type='submit'
                style={{
                  backgroundColor: brandColor,
                  borderColor: brandColor,
                }}
              >
                <BsSearch />
              </Button>
            </InputGroup>
          </Form>

          <Nav className='ms-auto'>
            {!token && !isLoadingUserData && (
              <Nav.Link as={Link} to='/login'>
                Login
              </Nav.Link>
            )}
            <div className='d-flex align-items-center'>
              <Notification />

              {isLoadingUserData && (
                <Nav.Item className='d-flex align-items-center'>
                  <Spinner animation='border' size='sm' className='me-2' />
                </Nav.Item>
              )}

              {isLoggedInAndLoaded && (
                <NavDropdown
                  title={dropdownTitle}
                  id='basic-nav-dropdown'
                  align='end'
                  className='no-caret' // Assicurati di avere CSS per nascondere la freccia se non la vuoi
                >
                  {isAdmin && (
                    <NavDropdown.Item as={Link} to='/admin/dashboard'>
                      <BsController style={{ marginRight: '8px' }} />
                      Pannello Admin
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item
                    as={Link}
                    to='/me'
                    className='d-flex align-items-center'
                  >
                    <BsPersonFill style={{ marginRight: '8px' }} />
                    Il Mio Profilo
                  </NavDropdown.Item>

                  <NavDropdown.Item
                    as={Link}
                    to='/ordini/gestione'
                    className='d-flex align-items-center'
                  >
                    <FaBoxOpen style={{ marginRight: '8px' }} />
                    Ordini
                  </NavDropdown.Item>

                  <NavDropdown.Item
                    as={Link}
                    to='/crea-prodotto'
                    className='d-flex align-items-center'
                  >
                    <BsFillTagFill style={{ marginRight: '8px' }} />
                    Vendi
                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item
                    onClick={handleLogout}
                    className='d-flex align-items-center text-danger'
                  >
                    <BsBoxArrowRight style={{ marginRight: '8px' }} />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
