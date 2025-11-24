import {
  Button,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
  Form,
  FormControl,
  InputGroup, // 🛑 Importante per unire select e input
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../Redux/Action';
import logo from '../assets/streetsell-logo.png';
import {
  BsBoxArrowRight,
  BsFillTagFill,
  BsBoxSeamFill,
  BsPersonFill,
  BsController,
  BsSearch, // Icona ricerca
} from 'react-icons/bs';
import Notification from './Notification';
import { FaBoxOpen } from 'react-icons/fa';
import { useState } from 'react'; // 🛑 Importa useState

function MyNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🛑 STATI PER LA RICERCA
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('prodotti'); // Default: cerca prodotti

  const token = localStorage.getItem('accessToken');
  const username = useSelector((state) => state.auth.user?.username);
  const ruolo = useSelector((state) => state.auth.user?.ruolo);

  const isLoggedInAndLoaded = token && username;
  const isAdmin = ruolo === 'ADMIN';
  const dropdownTitle = isAdmin ? 'Ciao, ADMIN' : `Ciao, ${username}`;
  const isLoadingUserData = token && !username;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  // 🛑 GESTIONE INVIO RICERCA
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      // Reindirizza alla pagina di ricerca con i parametri
      navigate(`/cerca?q=${query}&type=${searchType}`);
      setQuery(''); // Opzionale: pulisce la barra dopo la ricerca
    }
  };

  return (
    <Navbar expand='lg' className='bg-dark' data-bs-theme='dark'>
      <Container>
        <Navbar.Brand
          as={Link}
          to='/'
          className='p-0 m-0 d-flex align-items-center'
        >
          <img
            src={logo}
            alt='StreetSell Logo'
            height='70'
            className='d-inline-block align-top p-0 m-0'
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav>
            <Nav.Link as={Link} to='/'>
              Home
            </Nav.Link>
          </Nav>

          {/* 🛑 BARRA DI RICERCA AGGIORNATA */}
          <Form
            className='d-flex mx-auto'
            style={{ maxWidth: '600px' }}
            onSubmit={handleSearchSubmit}
          >
            <InputGroup>
              {/* Selettore Tipo (Prodotti/Utenti) */}
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  maxWidth: '110px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: 'none',
                }}
              >
                <option value='prodotti'>Prodotti</option>
                <option value='utenti'>Utenti</option>
              </Form.Select>

              {/* Campo Input */}
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

              {/* Bottone Invio */}
              <Button variant='success' type='submit'>
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
                className='no-caret'
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
                  to='/prodotti/me'
                  className='d-flex align-items-center'
                >
                  <BsBoxSeamFill style={{ marginRight: '8px' }} />I Miei
                  Prodotti
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
