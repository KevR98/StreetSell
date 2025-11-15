import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../Redux/Action';

function MyNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
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
          <Nav className='me-auto'>
            <Nav.Link as={Link} to='/'>
              Home
            </Nav.Link>
            {!token && (
              <Nav.Link as={Link} to='/login'>
                Login
              </Nav.Link>
            )}
            {token && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}
            <Nav.Link as={Link} to='/prodotti'>
              Vendi
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
