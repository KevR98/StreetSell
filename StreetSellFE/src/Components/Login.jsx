import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../Redux/Action/index';

const endpoint = 'http://localhost:8888/auth/login';

function Login() {
  // 1. State locali solo per i valori degli input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        localStorage.setItem('accessToken', data.token);
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
    <div className='container my-5' style={{ maxWidth: '400px' }}>
      <div className='card shadow-sm border-0'>
        <div className='card-body p-4'>
          <h2 className='card-title text-center mb-4'>Accedi</h2>
          {error && <div className='alert alert-danger'>{error}</div>}

          {/* Il form chiama la funzione handleSubmit quando viene inviato */}
          <form onSubmit={handleSubmit}>
            <div className='mb-3'>
              <label htmlFor='emailInput' className='form-label'>
                Indirizzo Email
              </label>
              <input
                type='email'
                className='form-control' // Classe Bootstrap per lo stile
                id='emailInput'
                value={email} // Il valore dell'input è legato allo stato 'email'
                onChange={(e) => setEmail(e.target.value)} // Aggiorna lo stato quando l'utente scrive
                required // Campo obbligatorio
              />
            </div>

            <div className='mb-3'>
              <label htmlFor='passwordInput' className='form-label'>
                Password
              </label>
              <input
                type='password'
                className='form-control'
                id='passwordInput'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className='d-grid mt-4'>
              <button type='submit' className='btn btn-primary btn-lg'>
                Accedi
              </button>
            </div>
          </form>

          {/* Link alla pagina di registrazione */}
          <div className='text-center mt-4'>
            <p className='mb-0'>Non hai ancora un account?</p>
            <Link to='/register'>Registrati ora</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
