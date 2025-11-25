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

const endpoint = 'http://localhost:8888/auth/register';

// ✅ BRAND COLOR
const BRAND_COLOR = '#fa8229';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Stile per tutti i Form.Control (Input) per garantire lo sfondo bianco
  const inputStyle = {
    backgroundColor: 'white',
    borderColor: '#ced4da',
  };

  // Stile per il bottone Occhio (InputGroup) per il contrasto

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Funzione per validare i campi
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (value.length > 0 && (value.length < 3 || value.length > 10)) {
          newErrors.username = "L'username deve avere tra 3 e 10 caratteri.";
        } else {
          delete newErrors.username; // Rimuove l'errore se il campo è valido
        }
        break;
      case 'email':
        // Regex semplice per controllare il formato email
        if (value.length > 0 && !/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Inserisci un formato email valido.';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
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

  const handleSubmit = (event) => {
    setError(null);
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Le password non corrispondono. Riprova.');
      return; // Blocca l'invio
    }

    const registration = {
      username: username,
      email: email,
      password: password,
    };

    fetch(endpoint, {
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
          return res.json().then((errorData) => {
            throw new Error(
              errorData.message || 'Errore durante la registrazione'
            );
          });
        }
      })

      .then(() => {
        setMessage('Registrazione avvenuta con successo');
        setUsername('');
        setEmail('');
        setPassword('');

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
          {/* La Card vera e propria */}
          <Card className='border-0' style={{ backgroundColor: 'transparent' }}>
            <Card.Body>
              <Card.Title className='text-center mb-4 fs-2'>
                Crea il Tuo Account
              </Card.Title>

              {/* Il Form con i campi di input */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='formBasicUsername'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Username*'
                    value={username}
                    onChange={(e) => {
                      const { value } = e.target;
                      setUsername(value); // Aggiorna lo stato
                      validateField('username', value);
                    }}
                    required
                    isInvalid={!!errors.username}
                    isValid={username.length > 0 && !errors.username}
                    // ✅ Stile Input
                    style={inputStyle}
                  />
                  <Form.Text className='text-muted'>
                    Deve avere tra 3 e 20 caratteri.
                  </Form.Text>
                  <Form.Control.Feedback type='invalid'>
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className='mb-3' controlId='formBasicEmail'>
                  <Form.Label>Indirizzo Email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Indirizzo Email*'
                    value={email}
                    onChange={(e) => {
                      const { value } = e.target;
                      setEmail(value);
                      validateField('email', value);
                    }}
                    required
                    isInvalid={!!errors.email}
                    isValid={email.length > 0 && !errors.email}
                    // ✅ Stile Input
                    style={inputStyle}
                  />
                  <Form.Text className='text-muted'>
                    Deve avere tra 3 e 10 caratteri.
                  </Form.Text>
                  <Form.Control.Feedback type='invalid'>
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
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
                        validateField('password', value);
                      }}
                      required
                      isInvalid={!!errors.password}
                      isValid={password.length > 7 && !errors.password}
                      // ✅ Stile Input
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

                {/* Conferma Password */}
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
                        validateField('confirmPassword', value);
                      }}
                      required
                      isInvalid={!!errors.confirmPassword}
                      isValid={
                        confirmPassword.length > 0 &&
                        !errors.confirmPassword &&
                        !errors.password
                      }
                      // ✅ Stile Input
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
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {error && <Alert variant='danger'>{error}</Alert>}
                {message && <Alert variant='success'>{message}</Alert>}

                {/* Il bottone a larghezza piena */}
                <div className='d-grid'>
                  <Button
                    type='submit'
                    size='lg'
                    // ✅ Stile Brand Color
                    style={{
                      backgroundColor: BRAND_COLOR,
                      borderColor: BRAND_COLOR,
                    }}
                  >
                    Registrati
                  </Button>
                </div>
              </Form>

              {/* Link per chi ha già un account */}
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
