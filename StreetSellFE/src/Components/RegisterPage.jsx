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
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const endpoint = 'http://localhost:8888/auth/register';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // 🛑 FUNZIONE DI VALIDAZIONE UNIFICATA E CORRETTA
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    // 1. Validazione GENERALE (username, email)
    switch (name) {
      case 'username':
        if (value.length > 0 && (value.length < 3 || value.length > 10)) {
          newErrors.username = "L'username deve avere tra 3 e 20 caratteri.";
        } else {
          delete newErrors.username;
        }
        break;
      case 'email':
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

    // 2. Logica di CONFRONTO PASSWORD
    // Dobbiamo ricontrollare il confronto ogni volta che cambia 'password' o 'confirmPassword'
    const currentPassword = name === 'password' ? value : password;
    const currentConfirm = name === 'confirmPassword' ? value : confirmPassword;

    if (name === 'password' || name === 'confirmPassword') {
      if (currentConfirm.length > 0 && currentPassword !== currentConfirm) {
        newErrors.confirmPassword = 'Le password non coincidono.';
      } else {
        // Se sono uguali e piene, rimuovi l'errore di non coincidenza
        if (newErrors.confirmPassword === 'Le password non coincidono.') {
          delete newErrors.confirmPassword;
        }
      }
    }

    // Aggiorna lo stato degli errori
    setErrors(newErrors);
  };

  // 🛑 Funzione Helper per gestire il cambio di stato con validazione
  const handlePasswordChange = (e, isConfirm = false) => {
    const { value } = e.target;
    if (isConfirm) {
      setConfirmPassword(value);
      // Rilancia la validazione per il confronto
      validateField('confirmPassword', value);
    } else {
      setPassword(value);
      validateField('password', value);
    }
    // Dopo aver modificato la password, controlla anche l'altro campo per l'errore di coincidenza
    validateField(
      isConfirm ? 'password' : 'confirmPassword',
      isConfirm ? password : confirmPassword
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 1. Esegui la validazione finale su tutti i campi per catturare i campi vuoti
    validateField('username', username);
    validateField('email', email);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);

    // 2. Prepara il controllo degli errori (Dobbiamo leggere gli errori DOPO la validazione finale,
    // ma per semplicità usiamo un controllo diretto e lo stato aggiornato).
    const isFormInvalid =
      Object.keys(errors).length > 0 ||
      password.length < 8 ||
      password !== confirmPassword ||
      !username ||
      !email; // Controlla anche se sono vuoti

    if (isFormInvalid) {
      setError(
        'Correggi gli errori e assicurati che tutti i campi siano compilati correttamente.'
      );
      return;
    }

    setError(null);

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
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        setError(err.message);
        setMessage('');
      });
  };

  return (
    <Container className='mt-5'>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={8} lg={6}>
          <Card className='shadow-sm'>
            <Card.Body>
              <Card.Title className='text-center mb-4 fs-2'>
                Crea il Tuo Account
              </Card.Title>

              <Form onSubmit={handleSubmit}>
                {/* 1. USERNAME */}
                <Form.Group className='mb-3' controlId='formBasicUsername'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Username*'
                    value={username}
                    onChange={(e) => {
                      const { value } = e.target;
                      setUsername(value);
                      validateField('username', value);
                    }}
                    required
                    isInvalid={!!errors.username}
                    isValid={username.length > 0 && !errors.username}
                  />
                  <Form.Text className='text-muted'>
                    Deve avere tra 3 e 20 caratteri.
                  </Form.Text>
                  <Form.Control.Feedback type='invalid'>
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* 2. EMAIL */}
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
                  />
                  <Form.Control.Feedback type='invalid'>
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* 3. PASSWORD */}
                <Form.Group className='mb-4' controlId='formBasicPassword'>
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Password*'
                      value={password}
                      onChange={(e) => handlePasswordChange(e, false)} // 🛑 Usa helper function
                      required
                      isInvalid={
                        !!errors.password ||
                        (confirmPassword.length > 0 &&
                          password !== confirmPassword)
                      }
                      isValid={password.length >= 8 && !errors.password}
                    />
                    <Button
                      variant='outline-secondary'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  <Form.Text className='text-muted'>
                    Deve avere almeno 8 caratteri.
                  </Form.Text>
                  <Form.Control.Feedback type='invalid'>
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* 4. CONFERMA PASSWORD */}
                <Form.Group className='mb-4' controlId='formConfirmPassword'>
                  <Form.Label>Conferma Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Conferma Password*'
                      value={confirmPassword}
                      onChange={(e) => handlePasswordChange(e, true)} // 🛑 Usa helper function
                      required
                      isInvalid={
                        !!errors.confirmPassword ||
                        (password.length > 0 && password !== confirmPassword)
                      }
                      isValid={
                        confirmPassword.length > 0 &&
                        !errors.confirmPassword &&
                        password === confirmPassword
                      }
                    />
                    <Button
                      variant='outline-secondary'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  <Form.Control.Feedback type='invalid'>
                    {errors.confirmPassword ||
                      (password.length > 0 && password !== confirmPassword
                        ? 'Le password non coincidono.'
                        : null)}
                  </Form.Control.Feedback>
                </Form.Group>

                {error && <Alert variant='danger'>{error}</Alert>}
                {message && <Alert variant='success'>{message}</Alert>}

                <div className='d-grid'>
                  <Button variant='primary' type='submit' size='lg'>
                    Registrati
                  </Button>
                </div>
              </Form>

              <div className='mt-4 text-center'>
                Hai già un account? <Link to='/login'>Accedi qui</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
