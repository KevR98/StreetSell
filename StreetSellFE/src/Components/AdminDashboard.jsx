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

// Endpoint API
const endpointUtenti = 'http://localhost:8888/utenti';
const endpointProdotti = 'http://localhost:8888/prodotti';

/**
 * Formatta una stringa di data nel formato locale 'it-IT'.
 * @param {string} dateString - La stringa della data.
 * @returns {string} La data formattata o 'N/D' se non disponibile.
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  return new Date(dateString).toLocaleDateString('it-IT');
};

function AdminDashboard() {
  // Stati per la gestione dei dati, del caricamento e degli errori
  const [utenti, setUtenti] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recupero del token di autenticazione e dell'utente corrente dallo stato Redux
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  // Effetto per il caricamento iniziale dei dati dell'Admin
  useEffect(() => {
    // Controllo del ruolo a livello di frontend (utile per l'UX)
    if (currentUser && currentUser.ruolo !== 'ADMIN') {
      setError('Accesso negato. Non sei un amministratore.');
      setLoading(false);
      return;
    }

    // Avvia la funzione di fetch dei dati
    fetchAdminData();
    // La dipendenza dal token è fondamentale per garantire che l'hook venga eseguito solo quando il token è disponibile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  /**
   * Funzione asincrona per il recupero dei dati di utenti e prodotti da mostrare nella dashboard.
   */
  const fetchAdminData = () => {
    // Controllo iniziale del token
    if (!token) {
      setLoading(false);
      setError('Token non trovato. Effettua il login come Admin.');
      return;
    }

    setError(null);
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Utenti (tutti)
    fetch(`${endpointUtenti}/all`, { headers })
      .then((response) => {
        if (!response.ok) {
          // Gestione degli errori della risposta HTTP
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

        // 2. CHAINING: Inizia la fetch Prodotti (tutti per l'admin, con paginazione ampia)
        return fetch(`${endpointProdotti}/admin/all?page=0&size=100`, {
          headers,
        });
      })
      .then((response) => {
        if (!response.ok) {
          // Gestione degli errori della risposta HTTP
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
        // Aggiorna lo stato dei prodotti
        setProdotti(prodottiData.content);
      })
      .catch((err) => {
        // Cattura e gestisce gli errori di entrambe le chiamate fetch
        console.error('Errore fetch Admin:', err);
        setError(err.message || 'Si è verificato un errore sconosciuto.');
      })
      .finally(() => {
        // Nasconde lo spinner di caricamento
        setLoading(false);
      });
  };

  /**
   * Gestisce l'attivazione/disattivazione di un account utente da parte dell'Admin.
   * @param {string} userId - L'ID dell'utente da modificare.
   * @param {boolean} isCurrentlyActive - Lo stato attuale dell'account.
   */
  const handleToggleAccount = (userId, isCurrentlyActive) => {
    const action = isCurrentlyActive ? 'disattiva' : 'riattiva';
    const endpoint = isCurrentlyActive
      ? `${endpointUtenti}/${userId}/admin-disattiva` // Endpoint per disattivare (DELETE)
      : `${endpointUtenti}/${userId}/reactivate`; // Endpoint per riattivare (PATCH)

    // Richiesta di conferma
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
          // Gestione errore
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
        fetchAdminData(); // Aggiorna i dati dopo l'operazione
      })
      .catch((err) => {
        console.error(`Errore nell'azione di ${action}:`, err);
        alert(`Errore: ${err.message}`);
      });
  };

  /**
   * Gestisce la sospensione di un annuncio prodotto da parte dell'Admin.
   * @param {string} prodottoId - L'ID del prodotto da sospendere.
   */
  const handleSuspendProduct = (prodottoId) => {
    // Richiesta di conferma
    if (
      !window.confirm(
        'Sei sicuro di voler sospendere/archiviare questo annuncio?'
      )
    ) {
      return;
    }

    fetch(`${endpointProdotti}/${prodottoId}/suspend`, {
      method: 'PATCH', // Metodo PATCH per la modifica dello stato
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
        fetchAdminData(); // Aggiorna i dati dopo l'operazione
      })
      .catch((err) => {
        console.error('Errore sospensione:', err);
        alert(`Errore: ${err.message}`);
      });
  };

  // Renderizzazione condizionale per caricamento e errore
  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message='Impossibile caricare la Dashboard' />;

  // Render della Dashboard
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
                {/* Visualizzazione Ruolo con Badge */}
                <Badge bg={utente.ruolo === 'ADMIN' ? 'dark' : 'secondary'}>
                  {utente.ruolo}
                </Badge>
              </td>
              <td className='align-middle'>
                {/* Visualizzazione Stato Attivo/Inattivo */}
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
                  // Impedisce la disattivazione dell'account Admin
                  disabled={utente.ruolo === 'ADMIN'}
                >
                  {utente.attivo ? <FaToggleOff /> : <FaToggleOn />}
                  {utente.attivo ? 'Disattiva' : 'Riattiva'}
                </Button>

                {/* Bottone SOSPENDI (Placeholder/futuro) */}
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

      {/* SEZIONE 2: GESTIONE PRODOTTI */}
      <h2 className='mt-5 mb-3'>Gestione Prodotti</h2>
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
                {/* Link alla pagina del prodotto */}
                <Link to={`/prodotto/${p.id}`} target='_blank'>
                  {p.titolo}
                </Link>
              </td>
              <td className='align-middle'>
                {/* Link alla pagina del venditore */}
                <Link to={`/utenti/${p.venditore.id}`}>
                  {p.venditore.username}
                </Link>
              </td>
              <td className='align-middle'>
                {/* Visualizzazione Stato Prodotto con Badge */}
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
                {/* Bottone Sospendi Prodotto */}
                <Button
                  variant='warning'
                  size='sm'
                  className='me-2'
                  onClick={() => handleSuspendProduct(p.id)}
                  // Disabilita se già archiviato o venduto (non ha senso sospendere)
                  disabled={
                    p.statoProdotto === 'ARCHIVIATO' ||
                    p.statoProdotto === 'VENDUTO'
                  }
                >
                  Sospendi
                </Button>
                {/* Bottone Elimina (forza) - Disabilitato per sicurezza in questo esempio */}
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
