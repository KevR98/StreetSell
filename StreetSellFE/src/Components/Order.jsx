import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import PurchaseModal from './PurchaseModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { Button } from 'react-bootstrap';

// Endpoint per le risorse
const endpointIndirizzi = 'http://localhost:8888/indirizzi';
const endpointOrdini = 'http://localhost:8888/ordini';
const orderManagementRoute = '/ordini/gestione'; // Rinominate ORDER_MANAGEMENT_ROUTE

const brandColor = '#fa8229';

/**
 * Componente per il bottone di acquisto che gestisce l'intera logica di pre-checkout e creazione ordine.
 * Accetta props di stile per il bottone.
 */
function Order({ prodottoId, size, className, style }) {
  // Stati per il Modal di acquisto e i dati utente
  const [showModal, setShowModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Stati per il caricamento e l'elaborazione
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [errorAddresses, setErrorAddresses] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Dati utente e navigazione
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  /**
   * Fetcha gli indirizzi di spedizione associati all'utente loggato.
   */
  const fetchUserAddresses = () => {
    if (!token) {
      setErrorAddresses('Token non disponibile. Effettua il login.');
      return;
    }

    setLoadingAddresses(true);
    setErrorAddresses(null);

    fetch(endpointIndirizzi, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Errore HTTP ${res.status}: Caricamento indirizzi fallito.`
          );
        }
        return res.json();
      })
      .then((data) => {
        setUserAddresses(data);
        // Se ci sono indirizzi, seleziona il primo come default
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      })
      .catch((err) => {
        setErrorAddresses(err.message);
      })
      .finally(() => {
        setLoadingAddresses(false);
      });
  };

  /**
   * Effetto: Carica gli indirizzi dell'utente quando il componente si monta o l'utente cambia.
   */
  useEffect(() => {
    // Carico gli indirizzi solo se l'utente è loggato e non ho ancora dati
    if (currentUser && !userAddresses.length) {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  /**
   * Gestisce la creazione dell'ordine (simulazione di acquisto).
   */
  const handlePurchase = () => {
    if (!selectedAddressId) {
      alert('Seleziona un indirizzo di spedizione per procedere.');
      return;
    }

    setIsProcessingOrder(true);

    const purchasePayload = {
      prodottoId: prodottoId,
      indirizzoId: selectedAddressId,
    };

    fetch(endpointOrdini, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(purchasePayload),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          // Gestione errore avanzata (tentativo di leggere il messaggio di errore dal body)
          return res.json().then((errData) => {
            throw new Error(
              errData.message || 'Acquisto fallito: Errore di validazione.'
            );
          });
        }
      })
      .then((newOrder) => {
        alert(`Ordine creato con successo! Stato: ${newOrder.statoOrdine}`);
        setShowModal(false);
        // Reindirizza l'utente alla pagina di gestione ordini
        navigate(orderManagementRoute);
      })
      .catch((err) => {
        alert(`Errore nell'acquisto: ${err.message}`);
      })
      .finally(() => {
        setIsProcessingOrder(false);
      });
  };

  // --- RENDERING CONDIZIONALE ---

  // Se l'utente non è loggato, mostra un link al login
  if (!currentUser) {
    return (
      <Button
        variant='success'
        size={size || 'lg'}
        className={className || 'w-100'}
        as={Link}
        to='/login'
      >
        Accedi per Acquistare
      </Button>
    );
  }

  // Se c'è un errore nel caricamento degli indirizzi
  if (errorAddresses) {
    return <ErrorAlert message={errorAddresses} />;
  }

  // RENDERING DEL BOTTONE E DEL MODAL
  return (
    <>
      <Button
        // Unisci lo stile personalizzato con lo stile del brand
        style={{
          ...style,
          backgroundColor: brandColor,
          borderColor: brandColor,
        }}
        size={size}
        className={className}
        onClick={() => setShowModal(true)}
        disabled={loadingAddresses || isProcessingOrder}
      >
        {loadingAddresses ? (
          // Spinner se sta caricando gli indirizzi
          <LoadingSpinner size='sm' />
        ) : isProcessingOrder ? (
          // Spinner se sta elaborando l'ordine
          <>
            <LoadingSpinner size='sm' /> Elaborazione...
          </>
        ) : (
          'Acquista Ora'
        )}
      </Button>

      {/* Modal di conferma acquisto */}
      <PurchaseModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        addresses={userAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onConfirmPurchase={handlePurchase}
        isProcessing={isProcessingOrder}
        onFetchAddresses={fetchUserAddresses} // Permette di ricaricare gli indirizzi dal modal
        token={token}
      />
    </>
  );
}

export default Order;
