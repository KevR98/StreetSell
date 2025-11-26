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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      setShowMobileSearch(false);
    }
  };

  const handleMobileNavClick = (to) => {
    if (to.includes('/cerca') && to.length < 8) {
      setShowMobileSearch(true);
      return;
    }

    if (
      !isLoggedInAndLoaded &&
      (to === '/me' || to === '/crea-prodotto' || to === '/ordini/gestione')
    ) {
      navigate('/login');
    } else {
      navigate(to);
    }
  };

  const mobileLinks = [
    { to: '/', icon: <BsHouseDoorFill size={20} />, label: 'Home' },
    {
      to: '/cerca',
      icon: <BsSearch size={20} />,
      label: 'Cerca',
    },
    { to: '/crea-prodotto', icon: <BsFillTagFill size={20} />, label: 'Vendi' },
    { label: 'Notifiche', isNotification: true },
    { to: '/me', icon: <BsPersonFill size={20} />, label: 'Profilo' },
  ];

  // ✅ COMPONENTE PER LA BARRA DI RICERCA MOBILE (Overlay) AGGIORNATO
  const MobileSearchOverlay = () => {
    if (!showMobileSearch) return null;

    return (
      <Navbar
        fixed='top'
        className='bg-dark d-flex d-sm-none shadow align-items-center'
        data-bs-theme='dark'
        style={{ padding: '0.5rem 1rem', zIndex: 1040 }}
      >
        <Form
          className='d-flex flex-grow-1 align-items-center'
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className='w-100'>
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
        <Button
          variant='link'
          className='text-white ms-2 p-0 text-nowrap align-self-center' // ✅ AGGIUNTO align-self-center
          onClick={() => setShowMobileSearch(false)}
        >
          Chiudi
        </Button>
      </Navbar>
    );
  };

  return (
    <>
      <MobileSearchOverlay />

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

              <div className='d-flex align-items-center justify-content-center h-100'>
                <Notification />
              </div>

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

      {/* 2. NAVBAR MOBILE */}
      <Navbar
        fixed='bottom'
        className='bg-dark d-flex d-sm-none'
        data-bs-theme='dark'
        style={{ padding: 0 }}
      >
        {/* BLOCCO STILE PER IL RESET CSS AGGRESSIVO */}
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
              return (
                <div
                  key={index}
                  className='dropup text-center d-flex flex-column align-items-center justify-content-center mobile-nav-item'
                  style={{
                    padding: '0.4rem 0',
                    flex: 1,
                    minWidth: 'auto',
                    color: 'white',
                    height: '100%',
                  }}
                >
                  {/* Icona Wrapper: Diamo l'altezza fissa e la classe di reset */}
                  <div
                    className='d-flex align-items-center justify-content-center w-100 mobile-notification-reset'
                    style={{
                      height: '24px',
                    }}
                  >
                    <Notification isMobile={true} />
                  </div>

                  {/* Scritta: Blocchiamo la centratura al 100% dello slot */}
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

            // CASO SPECIALE: PROFILO LOGGATO (Dropup)
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
                    <Dropdown.Item as={Link} to='/crea-prodotto'>
                      <BsFillTagFill className='me-2' /> Vendi
                    </Dropdown.Item>
                    <Dropdown.Divider />
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

            // LINK STANDARD (Home, Cerca, Vendi)
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
