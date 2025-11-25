import {
  Container,
  Table,
  Alert,
  Badge,
  Button,
  Row,
  Col,
  Dropdown,
  DropdownButton,
  ButtonGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaFilter,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import BackButton from './BackButton';
import ReviewModal from './ReviewModal';

// ENDPOINT UNIFICATO per recuperare tutte le task da fare
const ENDPOINT_FETCH_TASK = 'http://localhost:8888/ordini/gestione';
// ENDPOINT BASE per l'aggiornamento dello stato (PUT /ordini/{id}/stato)
const ENDPOINT_STATO_UPDATE_BASE = 'http://localhost:8888/ordini';

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // STATI PER I FILTRI
  const [salesFilter, setSalesFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED
  const [purchasesFilter, setPurchasesFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED, TO_REVIEW

  // STATI PER LA RECENSIONE
  const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());
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

  // APRIRE IL MODAL
  const handleOpenReviewModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
  };

  // SUBMIT RECENSIONE SUCCESS
  const handleReviewSuccess = () => {
    setShowReviewModal(false);

    // Aggiorniamo il Set locale
    if (selectedOrderId) {
      setReviewedOrderIds((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(selectedOrderId);
        return newSet;
      });
    }
    fetchOrders();
  };

  // AGGIORNAMENTO STATO
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
        if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);
        alert(successMessage);
        fetchOrders();
      })
      .catch((err) => {
        alert(`Errore durante l'aggiornamento: ${err.message}`);
      });
  };

  // ANNULLAMENTO ORDINE
  const handleCancelOrder = (orderId) => {
    if (
      window.confirm(
        'Sei sicuro di voler ANNULLARE questo ordine? Operazione irreversibile.'
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
          if (!res.ok) throw new Error('Errore annullamento');
          alert('Ordine annullato con successo.');
          fetchOrders();
        })
        .catch((err) => {
          alert(`Errore: ${err.message}`);
        });
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser]);

  // --- LOGICA DI FILTRAGGIO ---

  // 1. Filtraggio VENDITE (Sales)
  const filteredSales = orders.filter((order) => {
    // Deve essere una mia vendita
    if (order.venditore?.id !== currentUserId) return false;

    const s = order.statoOrdine;

    switch (salesFilter) {
      case 'ACTIVE': // In corso
        return s === 'CONFERMATO' || s === 'SPEDITO';
      case 'COMPLETED': // Completati
        return s === 'COMPLETATO';
      case 'CANCELLED': // Annullati
        return s === 'ANNULLATO';
      case 'ALL':
      default:
        return true;
    }
  });

  // 2. Filtraggio ACQUISTI (Purchases)
  const filteredPurchases = orders.filter((order) => {
    // Deve essere un mio acquisto
    if (order.compratore?.id !== currentUserId) return false;

    const s = order.statoOrdine;

    switch (purchasesFilter) {
      case 'ACTIVE': // In corso
        return s === 'CONFERMATO' || s === 'IN_ATTESA' || s === 'SPEDITO';
      case 'COMPLETED': // Completati (Storico)
        return s === 'COMPLETATO';
      case 'CANCELLED': // Annullati
        return s === 'ANNULLATO';
      case 'TO_REVIEW': {
        // Da Recensire
        if (s !== 'COMPLETATO') return false;
        // Logica recensione (Backend + Locale)
        const haRecensioneBackend = !!order.recensione;
        const haRecensioneLocale = reviewedOrderIds.has(order.id);
        return !haRecensioneBackend && !haRecensioneLocale;
      }
      case 'ALL':
      default:
        return true;
    }
  });

  // --- HELPER PER ETICHETTE DROPDOWN ---
  const getSalesLabel = () => {
    switch (salesFilter) {
      case 'ACTIVE':
        return 'In Corso';
      case 'COMPLETED':
        return 'Completati';
      case 'CANCELLED':
        return 'Annullati';
      default:
        return 'Tutte le Vendite';
    }
  };

  const getPurchasesLabel = () => {
    switch (purchasesFilter) {
      case 'ACTIVE':
        return 'In Corso';
      case 'COMPLETED':
        return 'Completati';
      case 'CANCELLED':
        return 'Annullati';
      case 'TO_REVIEW':
        return 'Da Recensire';
      default:
        return 'Tutti gli Acquisti';
    }
  };

  // --- RENDER RIGHE ---
  const renderOrderRows = (orderList, isSalesTable) => {
    return orderList.map((order) => {
      const isUserVendor = order.venditore?.id === currentUserId;
      const isUserBuyer = order.compratore?.id === currentUserId;

      const isTaskSpedire = isUserVendor && order.statoOrdine === 'CONFERMATO';
      const isTaskConfermare = isUserBuyer && order.statoOrdine === 'SPEDITO';

      // Controllo recensione per mostrare il BOTTONE (indipendente dal filtro lista)
      const hasReview = !!order.recensione || reviewedOrderIds.has(order.id);
      const isTaskRecensione =
        isUserBuyer && order.statoOrdine === 'COMPLETATO' && !hasReview;

      const canCancel =
        (isUserBuyer && order.statoOrdine === 'CONFERMATO') ||
        order.statoOrdine === 'IN_ATTESA';

      const isCancelled = order.statoOrdine === 'ANNULLATO';
      const isCompleted = order.statoOrdine === 'COMPLETATO';

      // Colori Badge
      let relationshipColor = 'secondary';
      let taskText = 'STORICO';

      if (isCancelled) {
        relationshipColor = 'danger';
        taskText = 'ANNULLATO';
      } else if (isCompleted) {
        relationshipColor = 'success';
        taskText = 'COMPLETATO';
      } else if (isTaskSpedire) {
        relationshipColor = 'warning';
        taskText = 'DA SPEDIRE';
      } else if (isTaskConfermare) {
        relationshipColor = 'primary';
        taskText = 'DA CONFERMARE';
      } else if (isTaskRecensione) {
        relationshipColor = 'info';
        taskText = 'DA RECENSIRE';
      } else if (order.statoOrdine === 'IN_ATTESA') {
        relationshipColor = 'secondary';
        taskText = 'IN ATTESA';
      }

      return (
        <tr key={order.id}>
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
                className='me-1'
                onClick={() => handleUpdateStatus(order.id, order.statoOrdine)}
              >
                <FaTruck /> Spedisci
              </Button>
            )}

            {isTaskConfermare && (
              <Button
                variant='primary'
                size='sm'
                className='me-1'
                onClick={() => handleUpdateStatus(order.id, order.statoOrdine)}
              >
                <FaCheckCircle /> Arrivato
              </Button>
            )}

            {isTaskRecensione && (
              <Button
                variant='info'
                size='sm'
                className='me-1'
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

            {/* Se non ci sono azioni e l'ordine è completato/annullato, mostriamo un placeholder o vuoto */}
            {!isTaskSpedire &&
              !isTaskConfermare &&
              !isTaskRecensione &&
              !canCancel && <span className='text-muted small fs-6'>-</span>}
          </td>
        </tr>
      );
    });
  };

  if (isLoading)
    return (
      <Container className='mt-5 text-center'>
        <LoadingSpinner />
      </Container>
    );

  if (error) return <ErrorAlert message={error} />;

  return (
    <Container className='my-5'>
      <BackButton />
      <h1 className='mb-4'>
        <FaBoxOpen className='me-2' /> Gestione Ordini
      </h1>

      <Row>
        {/* --- SEZIONE VENDITE --- */}
        <Col md={12} className='mb-5'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <div>
              <h2 className='m-0'></h2>
              <p className='text-muted m-0'>Gestisci gli ordini ricevuti.</p>
            </div>

            <DropdownButton
              as={ButtonGroup}
              variant='light'
              className='text-dark p-0 border-0'
              title={
                <>
                  <FaFilter className='me-2' /> {getSalesLabel()}
                </>
              }
              id='sales-dropdown'
              align='end'
            >
              <Dropdown.Item
                active={salesFilter === 'ALL'}
                onClick={() => setSalesFilter('ALL')}
              >
                Tutte le Vendite
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                active={salesFilter === 'ACTIVE'}
                onClick={() => setSalesFilter('ACTIVE')}
              >
                In Corso (Da Spedire)
              </Dropdown.Item>
              <Dropdown.Item
                active={salesFilter === 'COMPLETED'}
                onClick={() => setSalesFilter('COMPLETED')}
              >
                Completati
              </Dropdown.Item>
              <Dropdown.Item
                active={salesFilter === 'CANCELLED'}
                onClick={() => setSalesFilter('CANCELLED')}
              >
                Annullati
              </Dropdown.Item>
            </DropdownButton>
          </div>

          <Table striped bordered hover responsive className='shadow-sm'>
            <thead className='table-light'>
              <tr>
                <th>ID</th>
                <th>Stato</th>
                <th>Info</th>
                <th>Prodotto</th>
                <th>Compratore</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                renderOrderRows(filteredSales, true)
              ) : (
                <tr>
                  <td colSpan='6' className='text-center py-4'>
                    <Alert variant='light' className='m-0 border-0'>
                      Nessuna vendita trovata con questo filtro.
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

        {/* --- SEZIONE ACQUISTI --- */}
        <Col md={12} className='mt-4'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <div>
              <h2 className='m-0'>I Tuoi Acquisti</h2>
              <p className='text-muted m-0'>
                Traccia e gestisci i tuoi ordini.
              </p>
            </div>

            <DropdownButton
              as={ButtonGroup}
              variant='light'
              className='text-dark p-0 border-0'
              title={
                <>
                  <FaFilter className='me-2' /> {getPurchasesLabel()}
                </>
              }
              id='purchases-dropdown'
              align='end'
            >
              <Dropdown.Item
                active={purchasesFilter === 'ALL'}
                onClick={() => setPurchasesFilter('ALL')}
              >
                Tutti gli Acquisti
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                active={purchasesFilter === 'ACTIVE'}
                onClick={() => setPurchasesFilter('ACTIVE')}
              >
                In Corso
              </Dropdown.Item>
              <Dropdown.Item
                active={purchasesFilter === 'TO_REVIEW'}
                onClick={() => setPurchasesFilter('TO_REVIEW')}
              >
                Da Recensire
              </Dropdown.Item>
              <Dropdown.Item
                active={purchasesFilter === 'COMPLETED'}
                onClick={() => setPurchasesFilter('COMPLETED')}
              >
                Completati
              </Dropdown.Item>
              <Dropdown.Item
                active={purchasesFilter === 'CANCELLED'}
                onClick={() => setPurchasesFilter('CANCELLED')}
              >
                Annullati
              </Dropdown.Item>
            </DropdownButton>
          </div>

          <Table striped bordered hover responsive className='shadow-sm'>
            <thead className='table-light'>
              <tr>
                <th>ID</th>
                <th>Stato</th>
                <th>Info</th>
                <th>Prodotto</th>
                <th>Venditore</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                renderOrderRows(filteredPurchases, false)
              ) : (
                <tr>
                  <td colSpan='6' className='text-center py-4'>
                    <Alert variant='light' className='m-0 border-0'>
                      Nessun acquisto trovato con questo filtro.
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* MODALE DI RECENSIONE */}
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
