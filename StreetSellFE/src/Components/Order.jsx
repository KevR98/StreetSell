import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import PurchaseModal from './PurchaseModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { Button } from 'react-bootstrap';

const endpointIndirizzi = 'http://localhost:8888/indirizzi';
const endpointOrdini = 'http://localhost:8888/ordini';
const ORDER_MANAGEMENT_ROUTE = '/ordini/gestione';

const brandColor = '#fa8229';

// ✅ MODIFICATO: Accetta className, size e style
function Order({ prodottoId, size, className, style }) {
  const [showModal, setShowModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [errorAddresses, setErrorAddresses] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  // FUNZIONE PER CARICARE GLI INDIRIZZI
  const fetchUserAddresses = () => {
    if (!token) {
      setErrorAddresses('Token non disponibile.');
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

  // FETCH DEGLI INDIRIZZI AL MONTAGGIO DEL COMPONENTE
  useEffect(() => {
    if (currentUser && !userAddresses.length) {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  // FUNZIONE PER LANCIARTE L'ACQUISTO
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
        navigate(ORDER_MANAGEMENT_ROUTE);
      })
      .catch((err) => {
        alert(`Errore nell'acquisto: ${err.message}`);
      })
      .finally(() => {
        setIsProcessingOrder(false);
      });
  };

  // --- RENDERING CONDIZIONALE ---

  if (!currentUser) {
    // Se non loggato, mostra un link al login
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

  if (errorAddresses) {
    return <ErrorAlert message={errorAddresses} />;
  }

  // RENDERING DEL BOTTONE E DEL MODAL
  return (
    <>
      <Button
        style={{
          ...style,
          backgroundColor: brandColor,
          borderColor: brandColor,
        }}
        // ✅ FONDAMENTALE: Passiamo size, className e style ricevuti
        size={size}
        className={className}
        onClick={() => setShowModal(true)}
        disabled={loadingAddresses || isProcessingOrder}
      >
        {loadingAddresses ? (
          <LoadingSpinner size='sm' />
        ) : isProcessingOrder ? (
          <>
            <LoadingSpinner size='sm' /> Elaborazione...
          </>
        ) : (
          'Acquista Ora'
        )}
      </Button>

      <PurchaseModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        addresses={userAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onConfirmPurchase={handlePurchase}
        isProcessing={isProcessingOrder}
        onFetchAddresses={fetchUserAddresses}
        token={token}
      />
    </>
  );
}

export default Order;
