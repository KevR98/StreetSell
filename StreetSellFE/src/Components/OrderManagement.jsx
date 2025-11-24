import {
  Container,
  Table,
  Alert,
  Badge,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaStar, // 🛑 AGGIUNTO
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';
import ReviewModal from './ReviewModal'; // 🛑 NUOVO IMPORT

// 🛑 ENDPOINT UNIFICATO per recuperare tutte le task da fare
const ENDPOINT_FETCH_TASK = 'http://localhost:8888/ordini/gestione';
// 🛑 ENDPOINT BASE per l'aggiornamento dello stato (PUT /ordini/{id}/stato)
const ENDPOINT_STATO_UPDATE_BASE = 'http://localhost:8888/ordini';

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id; // ID dell'utente loggato

  // 🛑 STATI PER LA RECENSIONE
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Funzione per recuperare gli ordini
  const fetchOrders = () => {
    if (!token || !currentUser) {
      setError('Autenticazione richiesta.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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
        setOrders(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  // 🛑 FUNZIONE PER APRIRE IL MODAL
  const handleOpenReviewModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
  };

  // 🛑 FUNZIONE CHIAMATA DOPO IL SUBMIT DELLA RECENSIONE
  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    // Ricarichiamo gli ordini per nascondere il pulsante Recensione
    fetchOrders();
  };

  // GESTIONE UNIFICATA DELL'AGGIORNAMENTO STATO (omissis, rimane invariata)
  const handleUpdateStatus = (orderId, currentStatus) => {
    let newStatus;
    let actionMessage;
    let successMessage;

    if (currentStatus === 'CONFERMATO') {
      newStatus = 'SPEDITO';
      actionMessage = 'Confermi di aver SPEDITO questo ordine?';
      successMessage = 'Ordine marcato come SPEDITO.';
    } else if (currentStatus === 'SPEDITO') {
      newStatus = 'COMPLETATO';
      actionMessage =
        "Confermi che hai ricevuto l'ordine? L'azione è irreversibile.";
      successMessage = 'Ordine completato con successo!';
    } else {
      return;
    }

    if (!window.confirm(actionMessage)) return;

    fetch(`${ENDPOINT_STATO_UPDATE_BASE}/${orderId}/stato`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nuovoStato: newStatus }),
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errorData) => {
              throw new Error(
                errorData.message ||
                  `Errore HTTP ${res.status}: Impossibile completare l'azione.`
              );
            })
            .catch(() => {
              throw new Error(
                `Errore HTTP ${res.status}: Impossibile aggiornare lo stato dell'ordine.`
              );
            });
        }

        alert(successMessage);
        fetchOrders();
      })
      .catch((err) => {
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
        body: JSON.stringify({ nuovoStato: 'ANNULLATO' }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(
                errorData.message ||
                  "Impossibile annullare l'ordine in questo stato."
              );
            });
          }
          alert(
            `Ordine #${orderId.substring(0, 8)}... annullato con successo.`
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser]);

  if (isLoading)
    return (
      <Container className='mt-5 text-center'>
        <LoadingSpinner />
      </Container>
    );

  if (error) return <ErrorAlert message={error} />;

  // 🛑 LOGICA DI FILTRAGGIO DELLE LISTE (AGGIORNATA)
  // 1. Ordini che richiedono la mia attenzione come VENDITORE
  const mySales = orders.filter((order) => {
    const isUserVendor = order.venditore?.id === currentUserId;
    if (!isUserVendor) return false;

    const status = order.statoOrdine;
    // VENDITORE: Mostra CONFERMATO (da spedire) e COMPLETATO (notifica)
    return status === 'CONFERMATO' || status === 'COMPLETATO';
  });

  // 2. Ordini che richiedono la mia attenzione come COMPRATORE
  const myPurchases = orders.filter((order) => {
    const isUserBuyer = order.compratore?.id === currentUserId;
    if (!isUserBuyer) return false;

    const status = order.statoOrdine;
    // 🛑 COMPRATORE: Mostra CONFERMATO/IN_ATTESA (annulla), SPEDITO (conferma), e COMPLETATO (recensione)
    return (
      status === 'CONFERMATO' ||
      status === 'IN_ATTESA' ||
      status === 'SPEDITO' ||
      status === 'COMPLETATO' // 🛑 AGGIUNTO QUESTO STATO
    );
  });

  // Helper per mappare le righe della tabella
  const renderOrderRows = (orderList, isSalesTable) => {
    return orderList.map((order) => {
      const isUserVendor = order.venditore?.id === currentUserId;
      const isUserBuyer = order.compratore?.id === currentUserId;

      const isTaskSpedire = isUserVendor && order.statoOrdine === 'CONFERMATO';
      const isTaskConfermare = isUserBuyer && order.statoOrdine === 'SPEDITO';

      // 🛑 NUOVA TASK: Recensione (Solo compratore, ordine COMPLETO)
      const isTaskRecensione =
        isUserBuyer && order.statoOrdine === 'COMPLETATO';
      // ⚠️ ASSUMIAMO che il BE non restituisca ordini già recensiti
      // Se restituisce tutti i completati, qui andrebbe: && !order.recensione

      const canCancel =
        (isUserBuyer && order.statoOrdine === 'CONFERMATO') ||
        order.statoOrdine === 'IN_ATTESA';

      const isNotificationComplete =
        isUserVendor && order.statoOrdine === 'COMPLETATO';

      const relationshipColor = isTaskSpedire
        ? 'warning'
        : isTaskConfermare
        ? 'primary'
        : isTaskRecensione
        ? 'info'
        : 'secondary';

      const taskText = isTaskSpedire
        ? 'DA SPEDIRE'
        : isTaskConfermare
        ? 'DA CONFERMARE'
        : isTaskRecensione
        ? 'DA RECENSIRE'
        : isNotificationComplete
        ? 'NOTIFICA'
        : 'IN ATTESA';

      return (
        <tr
          key={order.id}
          className={
            isSalesTable && isTaskSpedire
              ? 'bg-warning-subtle'
              : !isSalesTable && isTaskConfermare
              ? 'bg-primary-subtle'
              : !isSalesTable && isTaskRecensione
              ? 'bg-info-subtle' // Colore per il feedback
              : ''
          }
        >
          <td>{order.id.substring(0, 8)}...</td>
          <td>
            <Badge bg={relationshipColor}>{order.statoOrdine}</Badge>
          </td>
          <td>
            <Badge bg={relationshipColor} className='fw-bold'>
              {taskText}
            </Badge>
          </td>
          <td>
            <Link to={`/prodotto/${order.prodotto?.id}`} target='_blank'>
              {order.prodotto?.titolo || 'Prodotto Eliminato'}
            </Link>
          </td>

          <td>
            {isSalesTable
              ? order.compratore?.username || 'N/D'
              : order.venditore?.username || 'N/D'}
          </td>

          <td>
            {isTaskSpedire && (
              <Button
                variant='success'
                size='sm'
                onClick={() => handleUpdateStatus(order.id, order.statoOrdine)}
              >
                <FaTruck /> Spedisci
              </Button>
            )}

            {isTaskConfermare && (
              <Button
                variant='primary'
                size='sm'
                onClick={() => handleUpdateStatus(order.id, order.statoOrdine)}
              >
                <FaCheckCircle /> Arrivato
              </Button>
            )}

            {/* 🛑 BOTTONE RECENSIONE */}
            {isTaskRecensione && (
              <Button
                variant='info'
                size='sm'
                onClick={() => handleOpenReviewModal(order.id)}
              >
                <FaStar /> Feedback
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

            {/* Azioni per Notifica Venditore Completato */}
            {isNotificationComplete && <Badge bg='success'>Completato</Badge>}
          </td>
        </tr>
      );
    });
  };

  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>
        <FaBoxOpen className='me-2' /> Gestione Ordini
      </h1>

      <Row>
        {/* === SEZIONE 1: LE MIE VENDITE (Task del Venditore) === */}
        <Col md={12} className='mb-5'>
          <h2>Le Tue Vendite ({mySales.length})</h2>
          <p className='text-muted'>
            Ordini in cui sei il venditore (Da spedire o notifiche).
          </p>

          <Table striped bordered hover responsive className='shadow-sm mt-3'>
            <thead>
              <tr>
                <th>ID Ordine</th>
                <th>Stato</th>
                <th>Azione Richiesta</th>
                <th>Prodotto</th>
                <th>Compratore</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {mySales.length > 0 ? (
                renderOrderRows(mySales, true)
              ) : (
                <tr>
                  <td colSpan='6'>
                    <Alert variant='info' className='m-0'>
                      Nessuna vendita effettuata
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>

        <Col md={12}>
          <hr />
        </Col>

        {/* === SEZIONE 2: I MIEI ACQUISTI (Task del Compratore) === */}
        <Col md={12} className='mt-4'>
          <h2>I Tuoi Acquisti ({myPurchases.length})</h2>
          <p className='text-muted'>
            Ordini in cui sei il compratore (Da annullare, confermare o
            recensire).
          </p>

          <Table striped bordered hover responsive className='shadow-sm mt-3'>
            <thead>
              <tr>
                <th>ID Ordine</th>
                <th>Stato</th>
                <th>Azione Richiesta</th>
                <th>Prodotto</th>
                <th>Venditore</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {myPurchases.length > 0 ? (
                renderOrderRows(myPurchases, false)
              ) : (
                <tr>
                  <td colSpan='6'>
                    <Alert variant='info' className='m-0'>
                      Nessun acquisto effettuato
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* 🛑 MODALE DI RECENSIONE */}
      <ReviewModal
        show={showReviewModal}
        handleClose={() => setShowReviewModal(false)}
        orderId={selectedOrderId}
        token={token}
        onReviewSuccess={handleReviewSuccess}
      />
    </Container>
  );
}

export default OrderManagementPage;
