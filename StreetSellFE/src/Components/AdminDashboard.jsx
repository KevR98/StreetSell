import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaUserCircle,
  FaToggleOn,
  FaToggleOff,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';

const endpointUtenti = 'http://localhost:8888/utenti';
const endpointProdotti = 'http://localhost:8888/prodotti';

const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  return new Date(dateString).toLocaleDateString('it-IT');
};

function AdminDashboard() {
  const [utenti, setUtenti] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Controllo del ruolo (security check frontend opzionale)
    if (currentUser && currentUser.ruolo !== 'ADMIN') {
      setError('Accesso negato. Non sei un amministratore.');
      setLoading(false);
      return;
    }

    // Avvia il fetch se l'utente è potenzialmente Admin o i dati sono null
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  const fetchAdminData = () => {
    if (!token) {
      setLoading(false);
      setError('Token non trovato. Effettua il login come Admin.');
      return;
    }

    setError(null);
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Utenti
    fetch(`${endpointUtenti}/all`, { headers })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Errore fetch utenti: ${response.status} - ${text.substring(
                0,
                100
              )}...`
            );
          });
        }
        return response.json();
      })
      .then((utentiData) => {
        setUtenti(utentiData);

        // CHAINING: Inizia la fetch Prodotti
        return fetch(`${endpointProdotti}/admin/all?page=0&size=100`, {
          headers,
        });
      })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Errore fetch prodotti: ${response.status} - ${text.substring(
                0,
                100
              )}...`
            );
          });
        }
        return response.json();
      })
      .then((prodottiData) => {
        // Aggiorna stato prodotti
        setProdotti(prodottiData.content);
      })
      .catch((err) => {
        // Cattura errori di entrambe le chiamate
        console.error('Errore fetch Admin:', err);
        setError(err.message || 'Si è verificato un errore sconosciuto.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleToggleAccount = (userId, isCurrentlyActive) => {
    const action = isCurrentlyActive ? 'disattiva' : 'riattiva';
    const endpoint = isCurrentlyActive
      ? `${endpointUtenti}/${userId}/admin-disattiva`
      : `${endpointUtenti}/${userId}/reactivate`;

    if (
      !window.confirm(
        `Sei sicuro di voler ${action} l'account di questo utente?`
      )
    ) {
      return;
    }

    fetch(endpoint, {
      method: isCurrentlyActive ? 'DELETE' : 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Errore durante l'azione di ${action}. Dettagli: ${text.substring(
                0,
                100
              )}...`
            );
          });
        }
      })
      .then(() => {
        alert(`Account ${action}to con successo!`);
        fetchAdminData(); // Lo richiamo per il refresh
      })
      .catch((err) => {
        console.error(`Errore nell'azione di ${action}:`, err);
        alert(`Errore: ${err.message}`);
      });
  };

  const handleSuspendProduct = (prodottoId) => {
    if (
      !window.confirm(
        'Sei sicuro di voler sospendere/archiviare questo annuncio?'
      )
    ) {
      return;
    }

    fetch(`${endpointProdotti}/${prodottoId}/suspend`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Errore durante la sospensione: ${response.status}`);
        }
      })
      .then(() => {
        alert('Prodotto sospeso con successo!');
        fetchAdminData(); // Lo richiamo per il refresh
      })
      .catch((err) => {
        console.error('Errore sospensione:', err);
        alert(`Errore: ${err.message}`);
      });
  };

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message='Impossibile caricare la Dashboard' />;

  return (
    <Container className='my-5'>
      <BackButton />

      <h1 className='mb-4 text-primary'>Pannello di Amministrazione 👑</h1>

      <hr />

      {/* SEZIONE 1: GESTIONE UTENTI */}
      <h2 className='mb-3'>Gestione Utenti</h2>
      <p>Totale utenti: {utenti.length}</p>
      <Table striped bordered hover responsive className='shadow-sm'>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Stato</th>
            <th>Annunci Attivi</th>
            <th>Data Creazione</th>
            <th className='text-center'>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr key={utente.id}>
              <td className='align-middle'>{utente.username}</td>
              <td className='align-middle'>{utente.email}</td>
              <td className='align-middle'>
                <Badge bg={utente.ruolo === 'ADMIN' ? 'dark' : 'secondary'}>
                  {utente.ruolo}
                </Badge>
              </td>
              <td className='align-middle'>
                <Badge bg={utente.attivo ? 'success' : 'danger'}>
                  {utente.attivo ? <FaCheckCircle /> : <FaTimesCircle />}{' '}
                  {utente.attivo ? 'Attivo' : 'Inattivo'}
                </Badge>
              </td>
              <td className='align-middle'>{utente.prodottiAttiviCount}</td>
              <td className='align-middle'>{formatDate(utente.createdAt)}</td>
              <td
                className='align-middle text-center'
                style={{ minWidth: '250px' }}
              >
                {/* Bottone VEDI PROFILO */}
                <Button
                  variant='outline-primary'
                  size='sm'
                  as={Link}
                  to={`/utenti/${utente.id}`}
                  className='me-2'
                >
                  <FaUserCircle /> Profilo
                </Button>

                {/* Bottone RIATTIVA/DISATTIVA */}
                <Button
                  variant={utente.attivo ? 'danger' : 'success'}
                  size='sm'
                  onClick={() => handleToggleAccount(utente.id, utente.attivo)}
                  className='me-2'
                  disabled={utente.ruolo === 'ADMIN'} // Non permettere di disattivare l'admin
                >
                  {utente.attivo ? <FaToggleOff /> : <FaToggleOn />}
                  {utente.attivo ? 'Disattiva' : 'Riattiva'}
                </Button>

                {/* Bottone SOSPENDI (Da implementare con logica separata se serve) */}
                <Button
                  variant='warning'
                  size='sm'
                  disabled={utente.ruolo === 'ADMIN'}
                >
                  <FaBan /> Sospendi
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* GESTIONE PRODOTTI (Placeholder per il futuro) */}
      <h2 className='mt-5 mb-3'>Gestione Prodotti (Placeholder)</h2>
      <Table striped bordered hover responsive className='shadow-sm'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titolo</th>
            <th>Venditore</th>
            <th>Stato</th>
            <th className='text-center'>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {prodotti.map((p) => (
            <tr key={p.id}>
              <td className='align-middle'>{p.id.substring(0, 8)}...</td>
              <td className='align-middle'>
                <Link to={`/prodotto/${p.id}`} target='_blank'>
                  {p.titolo}
                </Link>
              </td>
              <td className='align-middle'>
                <Link to={`/utenti/${p.venditore.id}`}>
                  {p.venditore.username}
                </Link>
              </td>
              <td className='align-middle'>
                <Badge
                  bg={
                    p.statoProdotto === 'DISPONIBILE'
                      ? 'success'
                      : p.statoProdotto === 'VENDUTO'
                      ? 'primary'
                      : 'warning'
                  }
                >
                  {p.statoProdotto}
                </Badge>
              </td>
              <td className='align-middle text-center'>
                <Button
                  variant='warning'
                  size='sm'
                  className='me-2'
                  onClick={() => handleSuspendProduct(p.id)}
                  disabled={
                    p.statoProdotto === 'ARCHIVIATO' ||
                    p.statoProdotto === 'VENDUTO'
                  }
                >
                  Sospendi
                </Button>
                <Button variant='danger' size='sm' disabled>
                  Elimina (Forza)
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminDashboard;
