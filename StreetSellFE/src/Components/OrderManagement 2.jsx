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

const ENDPOINT_FETCH_TASK = 'http://localhost:8888/ordini/gestione';
const ENDPOINT_STATO_UPDATE_BASE = 'http://localhost:8888/ordini';

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // STATI PER I FILTRI
  const [salesFilter, setSalesFilter] = useState('ALL');
  const [purchasesFilter, setPurchasesFilter] = useState('ALL');

  // STATI PER LA RECENSIONE
  const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
        if (res.status === 401) throw new Error('Non autorizzato.');
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

  const handleOpenReviewModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    if (selectedOrderId) {
      setReviewedOrderIds((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(selectedOrderId);
        return newSet;
      });
    }
    fetchOrders();
  };

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

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Sei sicuro di voler ANNULLARE questo ordine?')) {
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
  const filteredSales = orders.filter((order) => {
    if (order.venditore?.id !== currentUserId) return false;
    const s = order.statoOrdine;
    switch (salesFilter) {
      case 'ACTIVE':
        return s === 'CONFERMATO' || s === 'SPEDITO';
      case 'COMPLETED':
        return s === 'COMPLETATO';
      case 'CANCELLED':
        return s === 'ANNULLATO';
      case 'ALL':
      default:
        return true;
    }
  });

  const filteredPurchases = orders.filter((order) => {
    if (order.compratore?.id !== currentUserId) return false;
    const s = order.statoOrdine;
    switch (purchasesFilter) {
      case 'ACTIVE':
        return s === 'CONFERMATO' || s === 'IN_ATTESA' || s === 'SPEDITO';
      case 'COMPLETED':
        return s === 'COMPLETATO';
      case 'CANCELLED':
        return s === 'ANNULLATO';
      case 'TO_REVIEW': {
        if (s !== 'COMPLETATO') return false;
        const haRecensioneBackend = !!order.recensione;
        const haRecensioneLocale = reviewedOrderIds.has(order.id);
        return !haRecensioneBackend && !haRecensioneLocale;
      }
      case 'ALL':
      default:
        return true;
    }
  });

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

      const hasReview = !!order.recensione || reviewedOrderIds.has(order.id);
      const isTaskRecensione =
        isUserBuyer && order.statoOrdine === 'COMPLETATO' && !hasReview;

      const canCancel =
        (isUserBuyer && order.statoOrdine === 'CONFERMATO') ||
        order.statoOrdine === 'IN_ATTESA';

      const isCancelled = order.statoOrdine === 'ANNULLATO';
      const isCompleted = order.statoOrdine === 'COMPLETATO';

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

      const counterpartyName = isSalesTable
        ? order.compratore?.username || 'N/D'
        : order.venditore?.username || 'N/D';

      return (
        <tr key={order.id}>
          {/* ID: Nascosto su mobile */}
          <td className='d-none d-md-table-cell align-middle'>
            {order.id.substring(0, 8)}...
          </td>

          {/* STATO + INFO Compact */}
          <td className='align-middle'>
            <Badge bg={relationshipColor} className='fs-7-custom'>
              {order.statoOrdine}
            </Badge>
            <div className='d-md-none mt-1 text-muted fs-8-custom fw-bold'>
              {taskText}
            </div>
          </td>

          {/* INFO: Nascosto su mobile */}
          <td className='d-none d-md-table-cell align-middle'>
            <Badge bg={relationshipColor} className='fw-bold'>
              {taskText}
            </Badge>
          </td>

          {/* PRODOTTO + Controparte Compact */}
          <td className='align-middle'>
            <Link
              to={`/prodotto/${order.prodotto?.id}`}
              target='_blank'
              className='fw-bold text-decoration-none'
            >
              {order.prodotto?.titolo || 'Prodotto Eliminato'}
            </Link>
            <div className='d-md-none small text-muted mt-1'>
              {isSalesTable ? 'Compratore: ' : 'Venditore: '} {counterpartyName}
            </div>
          </td>

          {/* CONTROPARTE: Nascosto su mobile */}
          <td className='d-none d-md-table-cell align-middle'>
            {counterpartyName}
          </td>

          {/* AZIONI: Impilate su mobile */}
          <td className='align-middle'>
            <div className='d-flex flex-column flex-md-row gap-1'>
              {isTaskSpedire && (
                <Button
                  variant='success'
                  size='sm'
                  onClick={() =>
                    handleUpdateStatus(order.id, order.statoOrdine)
                  }
                  className='d-flex align-items-center justify-content-center'
                >
                  <FaTruck className='me-1' />{' '}
                  <span className='d-none d-md-inline'>Spedisci</span>
                </Button>
              )}

              {isTaskConfermare && (
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() =>
                    handleUpdateStatus(order.id, order.statoOrdine)
                  }
                  className='d-flex align-items-center justify-content-center'
                >
                  <FaCheckCircle className='me-1' />{' '}
                  <span className='d-none d-md-inline'>Arrivato</span>
                </Button>
              )}

              {isTaskRecensione && (
                <Button
                  variant='info'
                  size='sm'
                  onClick={() => handleOpenReviewModal(order.id)}
                  className='d-flex align-items-center justify-content-center'
                >
                  <FaStar className='me-1' />{' '}
                  <span className='d-none d-md-inline'>Feedback</span>
                </Button>
              )}

              {canCancel && (
                <Button
                  variant='danger'
                  size='sm'
                  onClick={() => handleCancelOrder(order.id)}
                  className='d-flex align-items-center justify-content-center'
                >
                  <FaTimesCircle className='me-1' />{' '}
                  <span className='d-none d-md-inline'>Annulla</span>
                </Button>
              )}
            </div>

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
      <h2 className='mb-4 fs-3 fs-md-1 fw-bold'>
        <FaBoxOpen className='me-2' /> Gestione Ordini
      </h2>

      <Row>
        {/* --- SEZIONE VENDITE --- */}
        <Col md={12} className='mb-5'>
          {/* ✅ USO LA GRID SYSTEM (Row/Col) per layout preciso */}
          <Row className='align-items-center mb-3 g-2'>
            {/* Titolo: Occupata tutto su mobile, metà su desktop */}
            <Col xs={12} md={6}>
              <h3 className='m-0 fs-4 fs-md-2'>Le Tue Vendite</h3>
              <p className='text-muted m-0 small'>
                Gestisci gli ordini ricevuti.
              </p>
            </Col>

            {/* Bottone: Occupata tutto su mobile, metà su desktop (spinto a destra con text-md-end) */}
            <Col xs={12} md={6} className='text-md-end'>
              <div className='d-grid d-md-inline-block'>
                <DropdownButton
                  as={ButtonGroup}
                  variant='light'
                  className='text-dark p-0 border border-secondary-subtle'
                  title={
                    <>
                      <FaFilter className='me-2' /> {getSalesLabel()}
                    </>
                  }
                  id='sales-dropdown'
                  align='end'
                >
                  <Dropdown.Item onClick={() => setSalesFilter('ALL')}>
                    Tutte
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setSalesFilter('ACTIVE')}>
                    In Corso
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSalesFilter('COMPLETED')}>
                    Completati
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSalesFilter('CANCELLED')}>
                    Annullati
                  </Dropdown.Item>
                </DropdownButton>
              </div>
            </Col>
          </Row>

          <Table
            striped
            bordered
            hover
            responsive
            className='shadow-sm align-middle'
          >
            <thead className='table-light'>
              <tr>
                <th className='d-none d-md-table-cell'>ID</th>
                <th>Stato</th>
                <th className='d-none d-md-table-cell'>Info</th>
                <th>Prodotto</th>
                <th className='d-none d-md-table-cell'>Compratore</th>
                <th style={{ minWidth: '80px' }}>Azioni</th>
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
          {/* ✅ HEADER ACQUISTI (Stesso Pattern Grid) */}
          <Row className='align-items-center mb-3 g-2'>
            <Col xs={12} md={6}>
              <h3 className='m-0 fs-4 fs-md-2'>I Tuoi Acquisti</h3>
              <p className='text-muted m-0 small'>Traccia i tuoi ordini.</p>
            </Col>

            <Col xs={12} md={6} className='text-md-end'>
              <div className='d-grid d-md-inline-block'>
                <DropdownButton
                  as={ButtonGroup}
                  variant='light'
                  className='text-dark p-0 border border-secondary-subtle'
                  title={
                    <>
                      <FaFilter className='me-2' /> {getPurchasesLabel()}
                    </>
                  }
                  id='purchases-dropdown'
                  align='end'
                >
                  <Dropdown.Item onClick={() => setPurchasesFilter('ALL')}>
                    Tutti
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setPurchasesFilter('ACTIVE')}>
                    In Corso
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setPurchasesFilter('TO_REVIEW')}
                  >
                    Da Recensire
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setPurchasesFilter('COMPLETED')}
                  >
                    Completati
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setPurchasesFilter('CANCELLED')}
                  >
                    Annullati
                  </Dropdown.Item>
                </DropdownButton>
              </div>
            </Col>
          </Row>

          <Table
            striped
            bordered
            hover
            responsive
            className='shadow-sm align-middle'
          >
            <thead className='table-light'>
              <tr>
                <th className='d-none d-md-table-cell'>ID</th>
                <th>Stato</th>
                <th className='d-none d-md-table-cell'>Info</th>
                <th>Prodotto</th>
                <th className='d-none d-md-table-cell'>Venditore</th>
                <th style={{ minWidth: '80px' }}>Azioni</th>
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
