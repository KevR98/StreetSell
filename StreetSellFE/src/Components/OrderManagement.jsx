import { Container, Table, Alert, Badge, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';

// 🛑 ENDPOINT UNIFICATO per recuperare tutte le task da fare
const ENDPOINT_FETCH_TASK = 'http://localhost:8888/ordini/gestione';
// 🛑 ENDPOINT BASE per l'aggiornamento dello stato (PUT /ordini/{id}/stato)
const ENDPOINT_STATO_UPDATE_BASE = 'http://localhost:8888/ordini';

// 🛑 Rimuovi la prop { roleType }
function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id; // ID dell'utente loggato

  // Funzione per recuperare gli ordini
  const fetchOrders = () => {
    if (!token || !currentUser) {
      setError('Autenticazione richiesta.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 🛑 Chiama l'endpoint unificato
    fetch(ENDPOINT_FETCH_TASK, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401)
          throw new Error('Non autorizzato. Effettua il login.');
        if (!res.ok) throw new Error('Errore nel caricamento delle task.');
        return res.json();
      })
      .then((data) => {
        // Data conterrà tutti gli ordini che richiedono un'azione (CONFERMATO o SPEDITO)
        setOrders(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  // GESTIONE UNIFICATA DELL'AGGIORNAMENTO STATO
  const handleUpdateStatus = (orderId, currentStatus) => {
    let newStatus;
    let actionMessage;
    let successMessage;

    // La logica è basata solo sullo stato attuale, perché solo le task attive arrivano qui.
    if (currentStatus === 'CONFERMATO') {
      // Task del VENDITORE: Segna come SPEDITO
      newStatus = 'SPEDITO';
      actionMessage = 'Confermi di aver SPEDITO questo ordine?';
      successMessage = 'Ordine marcato come SPEDITO.';
    } else if (currentStatus === 'SPEDITO') {
      // Task del COMPRATORE: Segna come COMPLETATO
      newStatus = 'COMPLETATO';
      actionMessage =
        "Confermi che hai ricevuto l'ordine? L'azione è irreversibile.";
      successMessage = 'Ordine completato con successo!';
    } else {
      return;
    }

    if (!window.confirm(actionMessage)) return;

    // Chiamata all'endpoint PUT che aggiorna lo stato
    fetch(`${ENDPOINT_STATO_UPDATE_BASE}/${orderId}/stato`, {
      // Usa la base corretta
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nuovoStato: newStatus }),
    })
      .then((res) => {
        if (!res.ok) {
          // 1. Il server ha risposto con un errore (es. 400, 403, 500)

          // Tentiamo di leggere il body della risposta per trovare un messaggio di errore JSON
          return res
            .json()
            .then((errorData) => {
              // Se troviamo un messaggio di errore specifico nel JSON del backend, lo usiamo
              throw new Error(
                errorData.message ||
                  `Errore HTTP ${res.status}: Impossibile completare l'azione.`
              );
            })
            .catch(() => {
              // Se la risposta non è JSON (es. un errore 500 nudo), usiamo un messaggio generico
              throw new Error(
                `Errore HTTP ${res.status}: Impossibile aggiornare lo stato dell'ordine.`
              );
            });
        }

        // 2. Il server ha risposto con successo (res.ok è true)
        alert(successMessage);
        fetchOrders(); // Ricarica la lista per l'aggiornamento immediato
      })
      .catch((err) => {
        // 3. Gestione di tutti gli errori (sia di rete che quelli lanciati sopra)
        alert(`Errore durante l'aggiornamento: ${err.message}`);
      });
  };

  const handleCancelOrder = (orderId) => {
    const token = localStorage.getItem('accessToken');

    if (
      window.confirm(
        'Sei sicuro di voler ANNULLARE questo ordine? Questa operazione è irreversibile.'
      )
    ) {
      fetch(`${ENDPOINT_STATO_UPDATE_BASE}/${orderId}/stato`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // 🛑 Imposta il nuovo stato come ANNULLATO
        body: JSON.stringify({ nuovoStato: 'ANNULLATO' }),
      })
        .then((res) => {
          if (!res.ok) {
            // Gestione errore, es. se l'ordine è già stato spedito
            throw new Error("Impossibile annullare l'ordine in questo stato.");
          }
          alert(
            `Ordine #${orderId.substring(0, 8)}... annullato con successo.`
          );
          // Aggiorna la lista degli ordini (dovrai definire una funzione di re-fetch)
          // Es. fetchMyOrders();
          fetchOrders();
        })
        .catch((err) => {
          console.error('Errore annullamento:', err);
          alert(`Errore: ${err.message}`);
        });
    }
  };

  useEffect(() => {
    fetchOrders();
    // 🛑 Rimuovi roleType dalle dipendenze
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser]);

  if (isLoading)
    return (
      <Container className='mt-5 text-center'>
        <LoadingSpinner />
      </Container>
    );

  if (error) return <ErrorAlert message={error} />;

  // 🛑 RENDERING UNIFICATO
  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>
        <FaBoxOpen className='me-2' /> Le Tue Task su Ordini ({orders.length})
      </h1>
      <p className='lead'>
        Qui trovi tutti gli ordini che richiedono una tua azione (spedizione o
        conferma ricezione).
      </p>

      <Table striped bordered hover responsive className='shadow-sm mt-3'>
        <thead>
          <tr>
            <th>ID Ordine</th>
            <th>Stato</th>
            <th>Task</th>
            <th>Prodotto</th>
            <th>Compratore</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const isUserVendor = order.venditore?.id === currentUserId;
              const isUserBuyer = order.compratore?.id === currentUserId;

              // Il backend ci invia solo gli stati che richiedono azione (CONFERMATO o SPEDITO)
              const isTaskSpedire =
                isUserVendor && order.statoOrdine === 'CONFERMATO';
              const isTaskConfermare =
                isUserBuyer && order.statoOrdine === 'SPEDITO';

              // 🛑 NUOVA LOGICA: Ordine Annullabile
              const canCancel =
                (isUserBuyer && order.statoOrdine === 'CONFERMATO') ||
                order.statoOrdine === 'IN_ATTESA';

              // Se l'ordine non è una task valida, salta
              // Ho rimosso il 'return null' in modo che, se l'endpoint dovesse includere IN_ATTESA,
              // l'ordine verrebbe comunque mostrato con l'azione "Annulla".
              if (!isTaskSpedire && !isTaskConfermare && !canCancel)
                return null;

              const relationshipText = isTaskSpedire
                ? `Vendita a ${order.compratore?.username || 'N/D'}`
                : `Acquisto da ${order.venditore?.username || 'N/D'}`;

              // Adatta il colore anche per l'annullamento
              let relationshipColor = 'secondary';
              if (isTaskSpedire) relationshipColor = 'warning';
              else if (isTaskConfermare) relationshipColor = 'primary';
              else if (canCancel) relationshipColor = 'info';

              return (
                <tr
                  key={order.id}
                  // Usa un colore per differenziare a colpo d'occhio le task
                  className={
                    isTaskSpedire ? 'bg-warning-subtle' : 'bg-primary-subtle'
                  }
                >
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>
                    <Badge bg={relationshipColor}>{order.statoOrdine}</Badge>
                  </td>
                  <td>
                    <Badge bg={relationshipColor} className='fw-bold'>
                      {isTaskSpedire
                        ? 'DA SPEDIRE'
                        : isTaskConfermare
                        ? 'DA CONFERMARE'
                        : 'IN ATTESA'}
                    </Badge>
                  </td>
                  <td>
                    <Link
                      to={`/prodotto/${order.prodotto?.id}`}
                      target='_blank'
                    >
                      {order.prodotto?.titolo || 'Prodotto Eliminato'}
                    </Link>
                  </td>

                  <td>{relationshipText}</td>

                  <td>
                    {/* Bottone VENDITORE: SPEDIRE */}
                    {isTaskSpedire && (
                      <Button
                        variant='success'
                        size='sm'
                        onClick={() =>
                          handleUpdateStatus(order.id, order.statoOrdine)
                        }
                      >
                        <FaTruck /> Spedisci
                      </Button>
                    )}

                    {/* Bottone COMPRATORE: CONFERMARE ARRIVO */}
                    {isTaskConfermare && (
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() =>
                          handleUpdateStatus(order.id, order.statoOrdine)
                        }
                      >
                        <FaCheckCircle /> Arrivato
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant='danger'
                        size='sm'
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <FaTimesCircle /> Annulla
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan='6'>
                <Alert variant='info' className='m-0'>
                  Nessuna task in attesa di azione. Tutto in ordine! 🥳
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrderManagementPage;
