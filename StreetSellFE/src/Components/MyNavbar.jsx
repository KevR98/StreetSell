import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../Redux/Action';

function MyNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const username = useSelector((state) => state.auth.user?.username);
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar expand='lg' className='bg-body-tertiary'>
      <Container>
        <Navbar.Brand href='/'>StreetSell</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          {/* Menu Principale a Sinistra */}
          <Nav className='me-auto'>
            <Nav.Link as={Link} to='/'>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to='/crea-prodotto'>
              Vendi
            </Nav.Link>
          </Nav>

          {/* Menu Utente a Destra (ml-auto spinge a destra) */}
          <Nav className='ms-auto'>
            {!token && (
              <Nav.Link as={Link} to='/login'>
                Login
              </Nav.Link>
            )}

            {token && (
              <NavDropdown
                // Il 'title' del dropdown è il tuo 'Ciao, Username'
                title={`Ciao, ${username || 'Utente'}`}
                id='basic-nav-dropdown'
                align='end' // Allinea il menu a tendina a destra per adattarsi alla Navbar
              >
                {/* 1. Funzione Profilo */}
                <NavDropdown.Item as={Link} to='/null'>
                  Il Mio Profilo
                </NavDropdown.Item>

                {/* 2. Funzione I Miei Prodotti */}
                <NavDropdown.Item as={Link} to='/prodotti/me'>
                  I Miei Prodotti
                </NavDropdown.Item>

                <NavDropdown.Divider />

                {/* 3. Funzione Logout */}
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
