import {
  Button,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
  Form,
  FormControl,
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
} from 'react-icons/bs';

function MyNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Legge il token dal browser
  const token = localStorage.getItem('accessToken');

  // Legge lo username da Redux (potrebbe essere undefined all'avvio)
  const username = useSelector((state) => state.auth.user?.username);

  const ruolo = useSelector((state) => state.auth.user?.ruolo);

  // STATO 3: Loggato E Dati Utente Caricati
  const isLoggedInAndLoaded = token && username;

  const isAdmin = ruolo === 'ADMIN';

  const dropdownTitle = isAdmin ? 'Ciao, ADMIN' : `Ciao, ${username}`;

  // STATO 2: Loggato MA Dati Utente in Caricamento (solo token presente)
  const isLoadingUserData = token && !username;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar expand='lg' className='bg-dark' data-bs-theme='dark'>
      <Container>
        <Navbar.Brand as={Link} to='/' className='d-flex align-items-center'>
          <img
            src={logo} // Usa la variabile importata
            alt='StreetSell Logo'
            height='70' // Imposta l'altezza per allinearlo alla navbar
            className='d-inline-block' // Classi Bootstrap per l'allineamento
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          {/* Menu Principale a Sinistra */}
          <Nav className='me-auto'>
            <Nav.Link as={Link} to='/'>
              Home
            </Nav.Link>
          </Nav>

          <Form className='d-flex mx-auto' style={{ maxWidth: '400px' }}>
            <FormControl
              type='search'
              placeholder='Cerca prodotti...'
              className='me-2'
              aria-label='Search'
              // NOTA: Qui andrebbero i props value={query} e onChange={handleChange}
            />
            <Button variant='outline-success'>Cerca</Button>
            {/* NOTA: Il Button type="submit" andrebbe gestito con una funzione onSubmit */}
          </Form>

          {/* Menu Utente a Destra (ms-auto) */}
          <Nav className='ms-auto'>
            {/* STATO 1: OFFLINE (Mostra Login) */}
            {!token && !isLoadingUserData && (
              <Nav.Link as={Link} to='/login'>
                Login
              </Nav.Link>
            )}

            {/* STATO 2: CARICAMENTO (Mostra Spinner) */}
            {isLoadingUserData && (
              <Nav.Item className='d-flex align-items-center'>
                <Spinner animation='border' size='sm' className='me-2' />
              </Nav.Item>
            )}

            {/* STATO 3: ONLINE E CARICATO (Mostra Dropdown) */}
            {isLoggedInAndLoaded && (
              <NavDropdown
                title={dropdownTitle}
                id='basic-nav-dropdown'
                align='end'
              >
                {isAdmin && (
                  <NavDropdown.Item as={Link} to='/admin/dashboard'>
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
