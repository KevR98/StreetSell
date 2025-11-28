import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../Redux/Action/index';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ErrorAlert from './ErrorAlert';

const loginEndpoint = 'http://localhost:8888/auth/login';
const brandColor = '#fa8229';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // Rinominate error in errorMessage

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Stile per tutti i Form.Control (Input) per garantire lo sfondo bianco
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  /**
   * Alterna la visibilità del campo password.
   */
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Gestisce l'invio del form e l'autenticazione tramite API.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage(null);

    const loginPayload = {
      email: email,
      password: password,
    };

    // Chiamata API di login
    fetch(loginEndpoint, {
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
          // Gestione degli errori HTTP, solleva un errore con un messaggio specifico
          throw new Error('Credenziali non valide. Riprova.');
        }
      })
      .then((data) => {
        const { token, user } = data;
        // Successo: Dispatch dell'azione di login e salvataggio del token in localStorage
        dispatch(loginSuccess({ user: user, token: token }));
        localStorage.setItem('accessToken', token);
        // Reindirizzamento alla homepage
        navigate('/');
      })
      .catch((err) => {
        // Fallimento: Salva l'errore per la visualizzazione e dispatch dell'azione di fallimento
        setErrorMessage(err.message);
        dispatch(loginFailure(err.message));
        console.error('Errore nel caricamento:', err);
      });
  };

  return (
    <Container className='my-5' style={{ maxWidth: '400px' }}>
      <Card className='border-0' style={{ backgroundColor: 'transparent' }}>
        <Card.Body>
          <h2 className='card-title text-center mb-4'>Accedi</h2>

          {/* Visualizza l'Alert di errore se errorMessage non è nullo */}
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <Form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <Form.Group className='mb-3' controlId='emailInput'>
              <Form.Label>Indirizzo Email</Form.Label>

              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </Form.Group>

            {/* Campo Password */}
            <Form.Group className='mb-3' controlId='passwordInput'>
              <Form.Label>Password</Form.Label>

              <InputGroup>
                {/* CAMPO DI INPUT: tipo dinamico per mostrare/nascondere la password */}
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Inserisci la password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />

                {/* BOTTONE OCULARIO */}
                <Button
                  variant='outline-secondary'
                  onClick={toggleShowPassword}
                  aria-label={
                    showPassword ? 'Nascondi password' : 'Mostra password'
                  }
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
                // Stile Brand Color
                style={{
                  backgroundColor: brandColor,
                  borderColor: brandColor,
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
