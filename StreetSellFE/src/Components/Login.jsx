import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../Redux/Action/index';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ErrorAlert from './ErrorAlert';

const endpoint = 'http://localhost:8888/auth/login';

// ✅ BRAND COLOR
const BRAND_COLOR = '#fa8229';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Stile per tutti i Form.Control (Input) per garantire lo sfondo bianco
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    setError(null);
    event.preventDefault();

    const loginPayload = {
      email: email,
      password: password,
    };

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginPayload),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Credenziali non valide. Riprova.');
        }
      })
      .then((data) => {
        const { token, user } = data;
        dispatch(loginSuccess({ user: user, token: token }));
        localStorage.setItem('accessToken', token);
        navigate('/');
      })
      .catch((err) => {
        setError(err.message);
        dispatch(loginFailure(err.message));
        console.error('Errore nel caricamento:', err);
      });
  };

  return (
    <Container className='my-5' style={{ maxWidth: '400px' }}>
      <Card
        // ✅ Rimosso shadow-sm, reso trasparente
        className='border-0'
        style={{ backgroundColor: 'transparent' }}
      >
        <Card.Body
          // ✅ Sfondo bianco per il Body (per contrasto)
          style={{
            backgroundColor: 'white',
            borderRadius: '0.375rem',
            padding: '1.5rem',
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
          }}
        >
          <h2 className='card-title text-center mb-4'>Accedi</h2>

          {error && <ErrorAlert message={error} />}

          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='emailInput'>
              <Form.Label>Indirizzo Email</Form.Label>

              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // ✅ Stile Input
                style={inputStyle}
              />
            </Form.Group>

            {/* Campo Password */}
            <Form.Group className='mb-3' controlId='passwordInput'>
              <Form.Label>Password</Form.Label>

              <InputGroup>
                {/* CAMPO DI INPUT */}
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Inserisci la password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  // ✅ Stile Input
                  style={inputStyle}
                />

                {/* BOTTONE OCULARIO */}
                <Button
                  variant='outline-secondary'
                  onClick={toggleShowPassword}
                  aria-label={
                    showPassword ? 'Nascondi password' : 'Mostra password'
                  }
                  // ✅ Stile Bottone Occhio
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Bottone Accedi */}
            <div className='d-grid mt-4'>
              <Button
                type='submit'
                size='lg'
                // ✅ Stile Brand Color
                style={{
                  backgroundColor: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                }}
              >
                Accedi
              </Button>
            </div>
          </Form>

          {/* Link alla pagina di registrazione */}
          <div className='text-center mt-4'>
            <p className='mb-0'>Non hai ancora un account?</p>
            <Link to='/register'>Registrati ora</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
