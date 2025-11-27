import React, { useState } from 'react';
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
  Dropdown,
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
  BsHouseDoorFill,
  BsBellFill,
  BsBoxArrowInRight, // ✅ 1. AGGIUNTO IMPORT ICONA LOGIN
} from 'react-icons/bs';
import Notification from './Notification';
import { FaBoxOpen } from 'react-icons/fa';

const brandColor = '#fa8229';

// COMPONENTE CUSTOM TOGGLE
const MobileNavToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className='d-flex flex-column align-items-center justify-content-center text-white w-100'
    style={{
      cursor: 'pointer',
      padding: '0.4rem 0',
      border: 'none',
      background: 'transparent',
    }}
  >
    {children}
  </div>
));

function MyNavbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // La barra di ricerca fissa appare solo in Home (/) E se l'utente è loggato.
  const shouldShowFixedSearchBar =
    isLoggedInAndLoaded && location.pathname === '/';

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

  const handleMobileNavClick = (to) => {
    if (to === '/cerca') {
      navigate(to);
      return;
    }

    // Controlla se il link richiede autenticazione
    const requiresAuth = allMobileLinks.find(
      (link) => link.to === to
    )?.requiresAuth;

    if (!isLoggedInAndLoaded && requiresAuth) {
      navigate('/login');
    } else {
      navigate(to);
    }
  };

  // Elenco base dei link mobile
  const allMobileLinks = [
    {
      to: '/',
      icon: <BsHouseDoorFill size={20} />,
      label: 'Home',
      requiresAuth: false,
    },
    {
      to: '/cerca',
      icon: <BsSearch size={20} />,
      label: 'Cerca',
      requiresAuth: false,
    },
    {
      to: '/crea-prodotto',
      icon: <BsFillTagFill size={20} />,
      label: 'Vendi',
      requiresAuth: true,
    },
    {
      label: 'Notifiche',
      isNotification: true,
      requiresAuth: true,
      icon: <BsBellFill size={20} />,
    },
    {
      to: '/me',
      icon: <BsPersonFill size={20} />,
      label: 'Profilo',
      requiresAuth: true,
    },
  ];

  // ✅ 2. LOGICA DINAMICA PER I LINK MOBILE MODIFICATA
  let mobileLinks = [];

  if (isLoggedInAndLoaded) {
    // Se loggato: mostra tutto
    mobileLinks = allMobileLinks;
  } else {
    // Se NON loggato
    const isHomeOrAuthPage = ['/', '/login', '/register'].includes(
      location.pathname
    );

    if (isHomeOrAuthPage) {
      // Se siamo in Home o Login/Register: Mostra Home e LOGIN (al posto di Cerca)
      mobileLinks = [
        {
          to: '/',
          icon: <BsHouseDoorFill size={20} />,
          label: 'Home',
          requiresAuth: false,
        },
        {
          to: '/login',
          icon: <BsBoxArrowInRight size={20} />,
          label: 'Login',
          requiresAuth: false,
        },
      ];
    } else {
      // Se siamo in altre pagine pubbliche (es. /cerca): Mostra Home e Cerca
      mobileLinks = allMobileLinks.filter((link) => !link.requiresAuth);
    }
  }

  // BARRA DI RICERCA FISSA (SOLO MOBILE E SOLO IN HOME LOGGATA)
  const MobileHomeSearchBar = () => {
    if (!shouldShowFixedSearchBar) return null;

    const inputHeight = '36px';

    return (
      <>
        <style type='text/css'>
          {`
              .dark-placeholder::placeholder {
                color: #adb5bd !important;
                opacity: 1;
              }
            `}
        </style>

        {/* 1. BARRA REALE (Fixed) */}
        <Navbar
          fixed='top'
          className='bg-dark d-flex d-sm-none shadow align-items-center'
          data-bs-theme='dark'
          style={{
            padding: '8px 15px',
            zIndex: 1030,
            minHeight: 'auto',
          }}
        >
          <Form
            className='d-flex flex-grow-1 align-items-center'
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim() !== '') {
                navigate(`/cerca?q=${query}&type=all`);
                setQuery('');
              }
            }}
            style={{ margin: 0 }}
          >
            <InputGroup className='w-100'>
              <FormControl
                type='search'
                placeholder='Cerca prodotto o utente...'
                aria-label='Search'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='dark-placeholder border-0 shadow-none'
                style={{
                  fontSize: '0.90rem',
                  height: inputHeight,
                  backgroundColor: '#2b3035',
                  color: '#fff',
                  borderTopLeftRadius: '20px',
                  borderBottomLeftRadius: '20px',
                  paddingLeft: '15px',
                }}
              />

              <Button
                type='submit'
                className='border-0'
                style={{
                  backgroundColor: brandColor,
                  height: inputHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px',
                }}
              >
                <BsSearch size={16} color='white' />
              </Button>
            </InputGroup>
          </Form>
        </Navbar>

        {/* 2. SPACER - Solo se loggato e in Home */}
        <div
          className='d-block d-sm-none'
          style={{ height: '52px', width: '100%' }}
        />
      </>
    );
  };

  return (
    <>
      <MobileHomeSearchBar />

      {/* 1. NAVBAR DESKTOP */}
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
            <div
              className='d-flex align-items-center gap-3'
              style={{ height: '40px' }}
            >
              <Nav.Item className='d-none d-sm-flex align-items-center h-100 mx-3'>
                <Nav.Link
                  as={Link}
                  to='/'
                  active={location.pathname === '/'}
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

              {/* Mostra Notifiche solo se loggato */}
              {isLoggedInAndLoaded && (
                <div className='d-flex align-items-center justify-content-center h-100'>
                  <Notification />
                </div>
              )}

              {isLoadingUserData && (
                <div className='d-flex align-items-center h-100'>
                  <Spinner
                    animation='border'
                    size='sm'
                    className='text-light'
                  />
                </div>
              )}

              {isLoggedInAndLoaded && (
                <NavDropdown
                  title={dropdownTitle}
                  id='basic-nav-dropdown'
                  align='end'
                  className='no-caret d-flex align-items-center h-100'
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

              {/* Link Login/Registrazione per desktop */}
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

      {/* 2. NAVBAR MOBILE (Footer) */}
      <Navbar
        fixed='bottom'
        className='bg-dark d-flex d-sm-none'
        data-bs-theme='dark'
        style={{ padding: 0 }}
      >
        <style type='text/css'>
          {`
            .mobile-notification-reset .nav-link,
            .mobile-notification-reset .dropdown-toggle {
              padding: 0 !important;
              margin: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 1 !important;
            }
          `}
        </style>

        <Nav className='w-100 d-flex justify-content-around align-items-center'>
          {mobileLinks.map((link, index) => {
            const isActive = location.pathname === link.to;

            // CASO SPECIALE: NOTIFICHE
            if (link.isNotification) {
              if (!isLoggedInAndLoaded) return null;

              return (
                <div
                  key={index}
                  className='dropup text-center d-flex flex-column align-items-center justify-content-center mobile-nav-item'
                  style={{
                    padding: '0.4rem 0',
                    flex: 1,
                    minWidth: 'auto',
                    color: 'white',
                  }}
                >
                  <div
                    className='d-flex align-items-center justify-content-center w-100 mobile-notification-reset'
                    style={{
                      height: '24px',
                    }}
                  >
                    <Notification isMobile={true} icon={link.icon} />
                  </div>

                  <small
                    className='d-block w-100 text-center'
                    style={{
                      fontSize: '0.60rem',
                      lineHeight: '1',
                      color: 'white',
                      marginTop: '2px',
                    }}
                  >
                    {link.label}
                  </small>
                </div>
              );
            }

            // CASO SPECIALE: PROFILO LOGGATO
            if (link.label === 'Profilo' && isLoggedInAndLoaded) {
              return (
                <Dropdown
                  key={link.to}
                  drop='up'
                  align='end'
                  style={{ flex: 1 }}
                  className='d-flex justify-content-center'
                >
                  <Dropdown.Toggle as={MobileNavToggle}>
                    <img
                      src={avatarToDisplay}
                      alt='Me'
                      className='rounded-circle'
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'cover',
                        border: isActive
                          ? `2px solid ${brandColor}`
                          : '1px solid #999',
                      }}
                    />
                    <small
                      style={{
                        fontSize: '0.60rem',
                        color: isActive ? brandColor : 'white',
                        marginTop: '2px',
                        lineHeight: '1',
                      }}
                    >
                      {link.label}
                    </small>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className='mb-3 shadow border-0'>
                    {isAdmin && (
                      <Dropdown.Item as={Link} to='/admin/dashboard'>
                        <BsController className='me-2' /> Admin
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item as={Link} to='/me'>
                      <BsPersonFill className='me-2' /> Il Mio Profilo
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to='/ordini/gestione'>
                      <FaBoxOpen className='me-2' /> Ordini
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to='/crea-prodotto'
                      className='d-flex align-items-center'
                    >
                      <BsFillTagFill style={{ marginRight: '8px' }} />
                      Vendi
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item
                      onClick={handleLogout}
                      className='text-danger'
                    >
                      <BsBoxArrowRight className='me-2' /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              );
            }

            // LINK STANDARD (Home, Cerca, Login)
            return (
              <Nav.Link
                key={link.to}
                onClick={() => handleMobileNavClick(link.to)}
                active={isActive}
                className={`text-center d-flex flex-column align-items-center justify-content-center mobile-nav-item`}
                style={{
                  padding: '0.4rem 0',
                  flex: 1,
                  minWidth: 'auto',
                  color: 'white',
                }}
              >
                <span
                  className='d-flex align-items-center justify-content-center'
                  style={{
                    color: isActive ? brandColor : 'white',
                    height: '24px',
                    marginBottom: '2px',
                  }}
                >
                  {link.icon}
                </span>
                <small
                  style={{
                    fontSize: '0.60rem',
                    lineHeight: '1',
                    marginTop: '0px',
                  }}
                >
                  {link.label}
                </small>
              </Nav.Link>
            );
          })}
        </Nav>
      </Navbar>
    </>
  );
}

export default MyNavbar;
