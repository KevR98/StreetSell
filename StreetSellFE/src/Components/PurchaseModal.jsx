import { useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import Indirizzo from './Indirizzo';

/* Componente Modal per la conferma dell'acquisto e la selezione dell'indirizzo di spedizione */
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
  // Stato per passare dalla visualizzazione lista indirizzi (false) al modulo di aggiunta (true)
  const [isAddingNew, setIsAddingNew] = useState(false);
  const hasAddresses = addresses && addresses.length > 0;

  /**
   * Gestisce il successo dell'aggiunta di un nuovo indirizzo dal componente <Indirizzo>.
   * Chiude il modulo e forza la ricarica della lista nel componente genitore.
   */
  // eslint-disable-next-line no-unused-vars
  const handleNewAddressAdded = (newAddress) => {
    setIsAddingNew(false);
    onFetchAddresses(); // Ricarica la lista completa degli indirizzi
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
          // Visualizzazione Modulo Aggiungi Indirizzo
          <>
            <h4>Aggiungi Nuovo Indirizzo</h4>
            <Indirizzo
              onAddressAdded={handleNewAddressAdded}
              onCancel={() => setIsAddingNew(false)}
              token={token}
            />
          </>
        ) : (
          // Visualizzazione Selezione Indirizzo
          <>
            {hasAddresses ? (
              // Mostra il dropdown di selezione se ci sono indirizzi salvati
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
              // Messaggio di avviso se non ci sono indirizzi
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
          // Disabilita se è in elaborazione o se il modulo di aggiunta è aperto
          disabled={isProcessing || isAddingNew}
        >
          Annulla
        </Button>

        <Button
          variant='success'
          onClick={onConfirmPurchase}
          // Disabilita se manca l'indirizzo, è in elaborazione o il modulo di aggiunta è aperto
          disabled={!selectedAddressId || isProcessing || isAddingNew}
        >
          {isProcessing ? (
            <>
              {/* Spinner se l'ordine è in elaborazione */}
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
