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

function Order({ prodottoId }) {
  const [showModal, setShowModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [errorAddresses, setErrorAddresses] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // Per il pulsante Acquista

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  // 1. FUNZIONE PER CARICARE GLI INDIRIZZI
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
            `Errore HTTP ${res.status}: Impossibile caricare gli indirizzi.`
          );
        }
        return res.json();
      })
      .then((data) => {
        setUserAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id); // Seleziona il primo di default
        }
      })
      .catch((err) => {
        console.error('Errore nel caricamento degli indirizzi:', err.message);
        setErrorAddresses(err.message);
      })
      .finally(() => {
        setLoadingAddresses(false);
      });
  };

  // 2. FETCH DEGLI INDIRIZZI AL MONTAGGIO DEL COMPONENTE
  useEffect(() => {
    // Carica gli indirizzi solo se l'utente è loggato e non stiamo già caricando
    if (currentUser && !userAddresses.length) {
      fetchUserAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, token]);

  // 3. FUNZIONE PER LANCIARTE L'ACQUISTO
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
          // Gestione degli errori dal backend (es. Prodotto non disponibile)
          return res.json().then((errData) => {
            throw new Error(
              errData.message ||
                'Acquisto fallito: Errore di validazione o disponibilità.'
            );
          });
        }
      })
      .then((newOrder) => {
        alert(`Ordine creato con successo! Stato: ${newOrder.statoOrdine}`);
        setShowModal(false);
        // Reindirizzamento a una pagina di successo o alla lista ordini
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
        size='lg'
        className='w-100'
        as={Link}
        to='/login'
      >
        Accedi per Acquistare
      </Button>
    );
  }

  if (errorAddresses) {
    // 🛑 Mostra il componente riutilizzabile ErrorAlert
    return <ErrorAlert message={errorAddresses} />;
  }

  // 4. RENDERING DEL BOTTONE E DEL MODAL
  return (
    <>
      <Button
        variant='success'
        size='lg'
        className='w-100'
        onClick={() => setShowModal(true)} // Apre il modal
        disabled={loadingAddresses || isProcessingOrder} // Disabilita durante il caricamento
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

      {/* Il Modal viene renderizzato ma è visibile solo se showModal è true */}
      <PurchaseModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        addresses={userAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onConfirmPurchase={handlePurchase}
        isProcessing={isProcessingOrder}
        onFetchAddresses={fetchUserAddresses} // Permette al modal di ricaricare la lista
        token={token} // Passa il token per l'API POST del form
      />
    </>
  );
}

export default Order;
