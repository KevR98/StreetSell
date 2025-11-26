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
import avatarDefault from '../assets/streetsell-profile-pic.png';
import {
  BsBoxArrowRight,
  BsFillTagFill,
  BsPersonFill,
  BsController,
  BsSearch,
  BsHouseDoorFill, // ✅ NUOVA ICONA HOME
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
  const user = useSelector((state) => state.auth.user);
  const username = user?.username;
  const ruolo = user?.ruolo;

  const isLoggedInAndLoaded = token && username;
  const isAdmin = ruolo === 'ADMIN';
  const isLoadingUserData = token && !username;

  const hasValidAvatar =
    user?.avatarUrl && user.avatarUrl !== 'default' && user.avatarUrl !== '';
  const avatarToDisplay = hasValidAvatar ? user.avatarUrl : avatarDefault;

  const dropdownTitle = (
    <div className='d-flex align-items-center justify-content-center'>
      <img
        src={avatarToDisplay}
        alt='Profilo'
        className='rounded-circle'
        style={{
          width: '32px',
          height: '32px',
          objectFit: 'cover',
          border: '1px solid #444',
        }}
      />
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      navigate(`/cerca?q=${query}&type=${searchType}`);
      setQuery('');
    }
  };

  // ✅ FUNZIONE PER NAVIGAZIONE MOBILE (Gestisce login/logout)
  const handleMobileNavClick = (to) => {
    // Se l'utente non è loggato e tenta di andare a /me, reindirizza al login
    if (
      !isLoggedInAndLoaded &&
      (to === '/me' || to === '/crea-prodotto' || to === '/ordini/gestione')
    ) {
      navigate('/login');
    } else {
      navigate(to);
    }
  };

  // ✅ DEFINIZIONE LINK MOBILE
  const mobileLinks = [
    { to: '/', icon: <BsHouseDoorFill size={20} />, label: 'Home' },
    {
      to: '/cerca?q=&type=prodotti',
      icon: <BsSearch size={20} />,
      label: 'Cerca',
    },
    { to: '/crea-prodotto', icon: <BsFillTagFill size={20} />, label: 'Vendi' },
    { to: '/ordini/gestione', icon: <FaBoxOpen size={20} />, label: 'Ordini' },
    { to: '/me', icon: <BsPersonFill size={20} />, label: 'Profilo' },
  ];

  return (
    <>
      {/* 1. NAVBAR DESKTOP (Mostrata da SM in su) */}
      <Navbar
        className='bg-dark mb-0 d-none d-sm-flex'
        data-bs-theme='dark'
        sticky='top'
      >
        <Container>
          <Link
            to='/'
            className='d-flex align-items-center text-decoration-none me-2 me-sm-3'
          >
            <img
              src={logo}
              alt='StreetSell Logo'
              height='40'
              className='logo-responsive'
              style={{ objectFit: 'contain', display: 'block' }}
            />
          </Link>

          <div className='d-flex flex-grow-1 align-items-center'>
            <Form
              className='d-flex flex-grow-1 mx-2 search-bar-responsive'
              onSubmit={handleSearchSubmit}
            >
              <InputGroup>
                <Form.Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className='d-none d-sm-block'
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
                  placeholder='Cerca...'
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
          </div>

          <Nav className='ms-auto flex-shrink-0'>
            {/* gap-3 distanzia le "scatole" tra loro */}
            <div
              className='d-flex align-items-center gap-3'
              style={{ height: '40px' }}
            >
              {/* 1. ICONA HOME */}
              <Nav.Item className='d-none d-sm-flex align-items-center h-100 mx-3'>
                <Nav.Link
                  as={Link}
                  to='/'
                  active={location.pathname === '/'}
                  // py-0 rimuove il padding verticale di Bootstrap che disallinea le cose
                  className='d-flex align-items-center justify-content-center py-0 px-2'
                  style={{ height: '100%' }}
                >
                  <BsHouseDoorFill
                    style={{
                      fontSize: '1.4rem',
                      color: 'white',
                      lineHeight: 1,
                    }}
                  />
                </Nav.Link>
              </Nav.Item>

              {/* 2. NOTIFICA */}
              {/* Avvolgiamo Notification in un contenitore identico agli altri */}
              <div className='d-flex align-items-center justify-content-center h-100'>
                <Notification />
              </div>

              {/* 3. SPINNER (Opzionale) */}
              {isLoadingUserData && (
                <div className='d-flex align-items-center h-100'>
                  <Spinner
                    animation='border'
                    size='sm'
                    className='text-light'
                  />
                </div>
              )}

              {/* 4. DROPDOWN UTENTE / AVATAR */}
              {isLoggedInAndLoaded && (
                <NavDropdown
                  title={dropdownTitle}
                  id='basic-nav-dropdown'
                  align='end'
                  className='no-caret d-flex align-items-center h-100' // Fondamentale: d-flex align-items-center qui
                  style={{ margin: 0, padding: 0 }}
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

              {/* 5. LINK LOGIN */}
              {!token && !isLoadingUserData && (
                <Nav.Link
                  as={Link}
                  to='/login'
                  className='d-none d-sm-flex align-items-center h-100 py-0'
                >
                  Login
                </Nav.Link>
              )}
            </div>
          </Nav>
        </Container>
      </Navbar>

      {/* 2. NAVBAR MOBILE FISSA IN BASSO (Mostrata solo su schermi XS/SM) */}
      <Navbar
        fixed='bottom'
        className='bg-dark d-flex d-sm-none'
        data-bs-theme='dark'
      >
        <Nav className='w-100 d-flex justify-content-around'>
          {mobileLinks.map((link) => {
            // Calcola se il link è attivo, riutilizzando la logica esistente
            const isActive =
              location.pathname === link.to ||
              (link.label === 'Cerca' &&
                location.pathname.startsWith('/cerca'));

            return (
              <Nav.Link
                key={link.to}
                onClick={() => handleMobileNavClick(link.to)}
                active={isActive}
                className={`text-center d-flex flex-column align-items-center mobile-nav-item`}
                style={{
                  padding: '0.4rem 0',
                  flex: 1,
                  minWidth: 'auto',
                  color: 'white',
                }}
              >
                <span
                  style={{
                    color: isActive ? brandColor : 'white', // Usa brandColor quando attivo
                  }}
                >
                  {link.icon}
                </span>
                <small style={{ fontSize: '0.65rem' }}>{link.label}</small>
              </Nav.Link>
            );
          })}
        </Nav>
      </Navbar>
    </>
  );
}

export default MyNavbar;
