import { useState } from 'react'; // 🛑 Necessario per 'isAddingNew'
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import Indirizzo from './Indirizzo'; // 🛑 Importa il tuo componente del form

function PurchaseModal({
  show,
  handleClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onConfirmPurchase,
  isProcessing,
  onFetchAddresses,
  token,
}) {
  // Stato per passare dalla visualizzazione lista (false) a quella del modulo (true)
  const [isAddingNew, setIsAddingNew] = useState(false);
  const hasAddresses = addresses && addresses.length > 0;

  // Questa funzione viene chiamata da Indirizzo.jsx al successo
  // eslint-disable-next-line no-unused-vars
  const handleNewAddressAdded = (newAddress) => {
    // 1. Chiude il form di aggiunta
    setIsAddingNew(false);
    // 2. Ricarica la lista degli indirizzi (nel componente Order.jsx)
    onFetchAddresses();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaShoppingCart className='me-2' />
          Conferma Acquisto
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isAddingNew ? (
          // **********************************************
          // ** A. VISUALIZZA IL MODULO PER AGGIUNGERE UN INDIRIZZO **
          // **********************************************
          <>
            <h4>Aggiungi Nuovo Indirizzo</h4>
            <Indirizzo
              onAddressAdded={handleNewAddressAdded}
              onCancel={() => setIsAddingNew(false)}
              token={token}
            />
          </>
        ) : (
          // **********************************************
          // ** B. VISUALIZZA LA SELEZIONE O L'AVVISO **
          // **********************************************
          <>
            {hasAddresses ? (
              // 1. Se ci sono indirizzi: Mostra il dropdown di selezione
              <Form.Group className='mb-3' controlId='addressSelection'>
                <Form.Label className='fw-bold'>
                  <FaMapMarkerAlt className='me-1 text-danger' />
                  Scegli Indirizzo di Spedizione:
                </Form.Label>

                <Form.Select
                  value={selectedAddressId}
                  onChange={(e) => onSelectAddress(e.target.value)}
                  disabled={isProcessing}
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.via}, {addr.cap} {addr.citta} ({addr.nazione})
                    </option>
                  ))}
                </Form.Select>

                <Form.Text className='text-muted mt-2'>
                  Seleziona un indirizzo o aggiungine uno nuovo.
                </Form.Text>
              </Form.Group>
            ) : (
              // 2. Se NON ci sono indirizzi: Mostra l'avviso
              <Alert variant='info'>
                Non hai indirizzi di spedizione salvati. Aggiungine uno qui
                sotto.
              </Alert>
            )}

            {/* Bottone che attiva il modulo di aggiunta */}
            <div className='text-end mt-3'>
              <Button
                variant='outline-primary'
                size='sm'
                onClick={() => setIsAddingNew(true)}
                disabled={isProcessing}
              >
                + Aggiungi Nuovo Indirizzo
              </Button>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant='secondary'
          onClick={handleClose}
          // Non si può chiudere mentre elabora o si sta aggiungendo l'indirizzo
          disabled={isProcessing || isAddingNew}
        >
          Annulla
        </Button>

        <Button
          variant='success'
          onClick={onConfirmPurchase}
          // 🛑 CONDIZIONE CORRETTA: Disabilita se manca un ID selezionato, o se si sta elaborando, o se siamo nel form di aggiunta.
          // L'ID selezionato viene impostato in Order.jsx dopo il fetch.
          disabled={!selectedAddressId || isProcessing || isAddingNew}
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size='sm' className='me-1' /> Elaborazione...
            </>
          ) : (
            'Conferma Acquisto'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PurchaseModal;
