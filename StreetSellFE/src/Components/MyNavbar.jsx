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

function MyNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Legge il token dal browser
  const token = localStorage.getItem('accessToken');

  // Legge lo username da Redux (potrebbe essere undefined all'avvio)
  const username = useSelector((state) => state.auth.user?.username);

  // STATO 3: Loggato E Dati Utente Caricati
  const isLoggedInAndLoaded = token && username;

  // STATO 2: Loggato MA Dati Utente in Caricamento (solo token presente)
  const isLoadingUserData = token && !username;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar expand='lg' className='bg-body-tertiary'>
      <Container>
        <Navbar.Brand as={Link} to='/'>
          StreetSell
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
                title={`Ciao, ${username}`}
                id='basic-nav-dropdown'
                align='end'
              >
                <NavDropdown.Item as={Link} to='/me'>
                  Il Mio Profilo
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to='/prodotti/me'>
                  I Miei Prodotti
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to='/crea-prodotto'>
                  Vendi
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={handleLogout}>
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
