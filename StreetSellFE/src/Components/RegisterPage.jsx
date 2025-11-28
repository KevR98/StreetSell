import { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Form,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const registerEndpoint = 'http://localhost:8888/auth/register'; // Rinominate endpoint
const brandColor = '#fa8229';

function RegisterPage() {
  // Stati per i campi di input
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Stato per la visibilità della password
  const [showPassword, setShowPassword] = useState(false);
  // Stati per feedback all'utente
  const [error, setError] = useState(null); // Usato per errori generali (API/confronto password)
  const [message, setMessage] = useState(''); // Usato per messaggi di successo
  const [errors, setErrors] = useState({}); // Usato per la validazione campo per campo

  const navigate = useNavigate();

  // Stile per tutti i Form.Control (Input)
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  /**
   * Alterna la visibilità dei campi password.
   */
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Funzione per la validazione in tempo reale dei campi.
   */
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        // L'username deve avere tra 3 e 10 caratteri.
        if (value.length > 0 && (value.length < 3 || value.length > 10)) {
          newErrors.username = "L'username deve avere tra 3 e 10 caratteri.";
        } else {
          delete newErrors.username;
        }
        break;
      case 'email':
        // Controllo del formato email
        if (value.length > 0 && !/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Inserisci un formato email valido.';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        // La password deve avere almeno 8 caratteri.
        if (value.length > 0 && value.length < 8) {
          newErrors.password = 'La password deve avere almeno 8 caratteri.';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  /**
   * Gestisce l'invio del form di registrazione.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setMessage('');

    // Validazione finale: confronto password
    if (password !== confirmPassword) {
      setError('Le password non corrispondono. Riprova.');
      return;
    }

    // Controlla se ci sono errori di validazione rimanenti
    if (Object.keys(errors).length > 0) {
      setError('Correggi gli errori nei campi prima di inviare.');
      return;
    }

    const registration = {
      username: username,
      email: email,
      password: password,
    };

    fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          // Gestione errori API (es. username/email già esistenti)
          return res.json().then((errorData) => {
            throw new Error(
              errorData.message || 'Errore durante la registrazione'
            );
          });
        }
      })
      .then(() => {
        setMessage(
          'Registrazione avvenuta con successo. Sarai reindirizzato al login.'
        );
        // Pulisce i campi
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Reindirizzamento al login dopo 2 secondi
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <Container className='mt-5'>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={8} lg={6}>
          {/* Card contenitore */}
          <Card className='border-0' style={{ backgroundColor: 'transparent' }}>
            <Card.Body>
              <Card.Title className='text-center mb-4 fs-2'>
                Crea il Tuo Account
              </Card.Title>

              {/* Form di Registrazione */}
              <Form onSubmit={handleSubmit}>
                {/* Campo Username */}
                <Form.Group className='mb-3' controlId='formBasicUsername'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Username*'
                    value={username}
                    onChange={(e) => {
                      const { value } = e.target;
                      setUsername(value);
                      validateField('username', value); // Validazione in tempo reale
                    }}
                    required
                    isInvalid={!!errors.username}
                    isValid={username.length > 0 && !errors.username}
                    style={inputStyle}
                  />
                  <Form.Text className='text-muted'>
                    Deve avere tra 3 e 10 caratteri.
                  </Form.Text>
                  <Form.Control.Feedback type='invalid'>
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Campo Email */}
                <Form.Group className='mb-3' controlId='formBasicEmail'>
                  <Form.Label>Indirizzo Email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Indirizzo Email*'
                    value={email}
                    onChange={(e) => {
                      const { value } = e.target;
                      setEmail(value);
                      validateField('email', value); // Validazione in tempo reale
                    }}
                    required
                    isInvalid={!!errors.email}
                    isValid={email.length > 0 && !errors.email}
                    style={inputStyle}
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Campo Password */}
                <Form.Group className='mb-4' controlId='formBasicPassword'>
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Password*'
                      value={password}
                      onChange={(e) => {
                        const { value } = e.target;
                        setPassword(value);
                        validateField('password', value); // Validazione in tempo reale
                      }}
                      required
                      isInvalid={!!errors.password}
                      isValid={password.length > 7 && !errors.password}
                      style={inputStyle}
                    />
                    <Button
                      variant='outline-secondary'
                      onClick={toggleShowPassword}
                      aria-label={
                        showPassword ? 'Nascondi password' : 'Mostra password'
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Form.Control.Feedback type='invalid'>
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Campo Conferma Password */}
                <Form.Group className='mb-4' controlId='formConfirmPassword'>
                  <Form.Label>Conferma Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Conferma Password*'
                      value={confirmPassword}
                      onChange={(e) => {
                        const { value } = e.target;
                        setConfirmPassword(value);
                        // La validazione non richiede una funzione dedicata qui, basta il confronto finale
                      }}
                      required
                      // Mostra errore se le password sono diverse (solo se entrambe sono piene)
                      isInvalid={
                        password !== confirmPassword &&
                        confirmPassword.length > 0
                      }
                      isValid={
                        confirmPassword.length > 0 &&
                        password === confirmPassword
                      }
                      style={inputStyle}
                    />
                    <Button
                      variant='outline-secondary'
                      onClick={toggleShowPassword}
                      aria-label={
                        showPassword ? 'Nascondi password' : 'Mostra password'
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Form.Control.Feedback type='invalid'>
                      Le password non corrispondono.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Alert di Feedback */}
                {error && <Alert variant='danger'>{error}</Alert>}
                {message && <Alert variant='success'>{message}</Alert>}

                {/* Bottone Registrati */}
                <div className='d-grid'>
                  <Button
                    type='submit'
                    size='lg'
                    style={{
                      backgroundColor: brandColor,
                      borderColor: brandColor,
                    }}
                    // Disabilita se ci sono errori di validazione locali o campi obbligatori mancanti
                    disabled={
                      Object.keys(errors).length > 0 ||
                      !username ||
                      !email ||
                      !password ||
                      !confirmPassword
                    }
                  >
                    Registrati
                  </Button>
                </div>
              </Form>

              {/* Link al Login */}
              <div className='mt-4 text-center'>
                Hai già un account? <a href='/login'>Accedi qui</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
