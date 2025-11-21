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

const endpoint = 'http://localhost:8888/utenti';

const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  // Assumiamo che la data di creazione dell'utente sia disponibile nel formato ISO
  return new Date(dateString).toLocaleDateString('it-IT');
};

function AdminDashboard() {
  const [utenti, setUtenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // 1. Controllo del ruolo (security check frontend opzionale)
    if (currentUser && currentUser.ruolo !== 'ADMIN') {
      setError('Accesso negato. Non sei un amministratore.');
      setLoading(false);
      return;
    }

    // Avvia il fetch se l'utente è potenzialmente Admin o i dati sono null
    fetchUtenti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  const fetchUtenti = () => {
    if (!token) {
      setLoading(false);
      setError('Token non trovato. Effettua il login come Admin.');
      return;
    }

    // Resetting state before fetch
    setError(null);
    setLoading(true);

    fetch(`${endpoint}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          // Se c'è un errore HTTP (es. 403 Forbidden o 401 Unauthorized)
          return response.text().then((text) => {
            // Tira un errore con il messaggio del backend
            throw new Error(
              `Errore fetch: ${response.status} - ${text.substring(0, 100)}...`
            );
          });
        }
        // Successo: procedi con la lettura del JSON
        return response.json();
      })
      .then((data) => {
        // Successo: aggiorna lo stato degli utenti
        setUtenti(data);
      })
      .catch((err) => {
        // Cattura errori di rete, errori HTTP thrown, e errori di parsing JSON
        console.error('Errore fetch Admin:', err);
        setError(err.message || 'Si è verificato un errore sconosciuto.');
      })
      .finally(() => {
        // 🛑 Finalizza il caricamento in ogni caso
        setLoading(false);
      });
  };

  const handleToggleAccount = (userId, isCurrentlyActive) => {
    const action = isCurrentlyActive ? 'disattiva' : 'riattiva';
    const endpoint = isCurrentlyActive
      ? `${endpoint}/${userId}/admin-disattiva` // DELETE/Soft-delete
      : `${endpoint}/${userId}/reactivate`; // PATCH

    // 1. Conferma utente
    if (
      !window.confirm(
        `Sei sicuro di voler ${action} l'account di questo utente?`
      )
    ) {
      return;
    }

    // 2. Esecuzione della Fetch con Promise Chain
    fetch(endpoint, {
      method: isCurrentlyActive ? 'DELETE' : 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        // 3. Controllo risposta HTTP
        if (!response.ok) {
          // Se c'è stato un errore (es. 403 Forbidden, 400 BadRequest)
          return response.text().then((text) => {
            // Tira un errore per catturarlo nel blocco .catch
            throw new Error(
              `Errore durante l'azione di ${action}. Dettagli: ${text.substring(
                0,
                100
              )}...`
            );
          });
        }
        // Per DELETE e PATCH, la risposta non ha body, quindi procediamo direttamente.
      })
      .then(() => {
        // 4. Successo: Aggiorna il frontend
        alert(`Account ${action}to con successo!`);
        // Ricarica la lista completa degli utenti per aggiornare la tabella
        fetchUtenti();
      })
      .catch((err) => {
        // 5. Gestione Errori
        console.error(`Errore nell'azione di ${action}:`, err);
        alert(`Errore: ${err.message}`);
      });
  };

  if (loading)
    return (
      <Container className='mt-5 text-center'>
        <Spinner animation='border' />
      </Container>
    );
  if (error)
    return (
      <Container className='mt-5'>
        <Alert variant='danger'>Errore di Caricamento: {error}</Alert>
      </Container>
    );

  return (
    <Container className='my-5'>
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
              {/* PLACEHOLDER: La tua idea era ottima ma richiede modifiche al backend */}
              <td className='align-middle'>{utente.prodottiAttiviCount}</td>
              <td className='align-middle'>{formatDate(utente.createdAt)}</td>
              <td
                className='align-middle text-center'
                style={{ minWidth: '250px' }}
              >
                {/* 1. Bottone VEDI PROFILO */}
                <Button
                  variant='outline-primary'
                  size='sm'
                  as={Link}
                  to={`/utenti/${utente.id}`}
                  className='me-2'
                >
                  <FaUserCircle /> Profilo
                </Button>

                {/* 2. Bottone RIATTIVA/DISATTIVA */}
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

                {/* 3. Bottone SOSPENDI (Da implementare con logica separata se serve) */}
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

      {/* SEZIONE 2: GESTIONE PRODOTTI (Placeholder per il futuro) */}
      <h2 className='mt-5 mb-3'>Gestione Prodotti (Placeholder)</h2>
      <Alert variant='warning'>
        Questa sezione mostrerà tutti gli annunci (Disponibili, Venduti,
        Archiviati) e i pulsanti di moderazione.
      </Alert>
    </Container>
  );
}

export default AdminDashboard;
