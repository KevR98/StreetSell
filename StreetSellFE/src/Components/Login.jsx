import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../Redux/Action/index';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button, Card, Container, Form, InputGroup } from 'react-bootstrap';
import ErrorAlert from './ErrorAlert';

const endpoint = 'http://localhost:8888/auth/login';

function Login() {
  // 1. State locali solo per i valori degli input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 2. Funzione che gestisce l'invio del form
  const handleSubmit = (event) => {
    setError(null);
    // Previene il ricaricamento della pagina, che è il comportamento di default dei form HTML
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
        const { token, user } = data; // 🛑 CORREZIONE QUI
        dispatch(loginSuccess({ user: user, token: token }));
        localStorage.setItem('accessToken', token);
        navigate('/');
      })
      .catch((err) => {
        // Gestisci l'errore per l'utente
        setError(err.message);
        dispatch(loginFailure(err.message));
        console.error('Errore nel caricamento:', err);
      });
  };

  return (
    <Container className='my-5' style={{ maxWidth: '400px' }}>
      <Card className='shadow-sm border-0'>
        <Card.Body className='p-4'>
          <h2 className='card-title text-center mb-4'>Accedi</h2>
          {error && <ErrorAlert message={error} />}

          {/* Il form chiama la funzione handleSubmit quando viene inviato */}
          <Form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <Form.Group className='mb-3' controlId='emailInput'>
              <Form.Label>Indirizzo Email</Form.Label>
              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Password (Pronto per l'InputGroup e il bottone occhio) */}
            <Form.Group className='mb-3' controlId='passwordInput'>
              <Form.Label>Password</Form.Label>

              <InputGroup>
                {/* 🛑 CAMPO DI INPUT */}
                <Form.Control
                  // 🛑 La chiave: Cambia il tipo in base allo stato 'showPassword'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Inserisci la password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* 🛑 BOTTONE OCULARIO */}
                <Button
                  variant='outline-secondary'
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? 'Nascondi password' : 'Mostra password'
                  }
                >
                  {/* L'icona cambia in base allo stato */}
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className='d-grid mt-4'>
              <Button type='submit' variant='primary' size='lg'>
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
