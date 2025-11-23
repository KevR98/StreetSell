import { Container, Table, Alert, Badge, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTruck, FaBoxOpen } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

// Assicurati di avere questi componenti di utilità o sostituiscili con equivalenti
// import LoadingSpinner from './LoadingSpinner';
// import ErrorAlert from './ErrorAlert';
// import BackButton from './BackButton';

// 🛑 ENDPOINT: Punterà al nuovo endpoint che creeremo nel Controller Java
const ENDPOINT_ORDINI_VENDITORE = 'http://localhost:8888/ordini/venditore';
const ENDPOINT_STATO_UPDATE = 'http://localhost:8888/ordini';

function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');
  const currentUser = useSelector((state) => state.auth.user);

  // Funzione per recuperare gli ordini
  const fetchOrders = () => {
    if (!token || !currentUser) {
      setError('Autenticazione richiesta.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(ENDPOINT_ORDINI_VENDITORE, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401)
          throw new Error('Non autorizzato. Effettua il login.');
        if (!res.ok) throw new Error('Errore nel caricamento degli ordini.');
        return res.json();
      })
      .then((data) => {
        // Se il BE invia solo gli ordini CONFERMATI, non serve filtrare qui
        setOrders(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  // Gestione della spedizione
  const handleMarkAsShipped = (orderId) => {
    if (!window.confirm('Confermi di aver SPEDITO questo ordine?')) return;

    // Chiamata all'endpoint PUT che aggiorna lo stato
    fetch(`${ENDPOINT_STATO_UPDATE}/${orderId}/stato`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Usiamo il DTO OrdineStatoDTO per inviare il nuovo stato al backend
      body: JSON.stringify({ nuovoStato: 'SPEDITO' }),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Impossibile aggiornare lo stato dell'ordine.");
        alert('Ordine marcato come SPEDITO. Verrà rimosso dalla lista.');
        fetchOrders(); // Ricarica la lista per mostrare la modifica
      })
      .catch((err) => alert(`Errore durante l'aggiornamento: ${err.message}`));
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

  if (error) return <ErrorAlert />;

  return (
    <Container className='my-5'>
      {/* Se hai un componente BackButton, mettilo qui */}

      <h1 className='mb-4'>
        <FaBoxOpen className='me-2' /> Ordini in Attesa di Spedizione (
        {orders.length})
      </h1>
      <p className='lead'>
        Questi sono gli ordini dei tuoi prodotti che devi preparare e spedire.
      </p>

      <Table striped bordered hover responsive className='shadow-sm mt-3'>
        <thead>
          <tr>
            <th>ID Ordine</th>
            <th>Stato</th>
            <th>Prodotto</th>
            <th>Compratore</th>
            <th>Data Ordine</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>
                  <Badge
                    bg={
                      order.statoOrdine === 'CONFERMATO' ? 'warning' : 'success'
                    }
                  >
                    {order.statoOrdine}
                  </Badge>
                </td>
                <td>
                  <Link to={`/prodotto/${order.prodotto?.id}`} target='_blank'>
                    {order.prodotto?.titolo || 'Prodotto Eliminato'}
                  </Link>
                </td>

                {/* 🛑 MODIFICA QUI: Aggiungi ? dopo l'oggetto padre */}
                <td>{order.compratore?.username || 'N/D'}</td>
                <td>{new Date(order.dataOrdine).toLocaleDateString()}</td>
                <td>
                  {order.statoOrdine === 'CONFERMATO' && (
                    <Button
                      variant='success'
                      size='sm'
                      onClick={() => handleMarkAsShipped(order.id)}
                    >
                      <FaTruck /> Spedito
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='6'>
                <Alert variant='info' className='m-0'>
                  Nessun ordine in attesa di spedizione. Tempo di relax! ☕
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default VendorOrdersPage;
