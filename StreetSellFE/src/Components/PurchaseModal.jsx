import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

function PurchaseModal({
  show, // Mostra/nascondi il modal
  handleClose, // Funzione per chiudere il modal
  addresses, // Lista degli indirizzi
  selectedAddressId, // ID selezionato
  onSelectAddress, // Funzione per gestire la selezione
  onConfirmPurchase, // Funzione per confermare l'acquisto (lancia il fetch)
  isProcessing, // Indica se l'ordine è in elaborazione (nuova prop)
}) {
  const hasAddresses = addresses && addresses.length > 0;

  return (
    <Modal show={show} onHide={handleClose} centered>
      {/* Intestazione del Modale */}
      <Modal.Header closeButton>
        <Modal.Title>
          <FaShoppingCart className='me-2' />
          Conferma Acquisto
        </Modal.Title>
      </Modal.Header>

      {/* Corpo del Modale (Selezione Indirizzo) */}
      <Modal.Body>
        {hasAddresses ? (
          <Form>
            <Form.Group className='mb-3' controlId='addressSelection'>
              <Form.Label className='fw-bold'>
                <FaMapMarkerAlt className='me-1 text-danger' />
                Scegli Indirizzo di Spedizione:
              </Form.Label>

              {/* Dropdown per selezionare l'indirizzo */}
              <Form.Select
                value={selectedAddressId}
                onChange={(e) => onSelectAddress(e.target.value)}
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.via}, {addr.cap} {addr.citta} ({addr.nazione})
                  </option>
                ))}
              </Form.Select>

              <Form.Text className='text-muted mt-2'>
                Assicurati che l'indirizzo sia corretto prima di confermare.
              </Form.Text>
            </Form.Group>
          </Form>
        ) : (
          // Alert se non ci sono indirizzi salvati
          <Alert variant='warning'>
            Non hai indirizzi di spedizione salvati. Vai al tuo profilo per
            aggiungerne uno prima di procedere.
          </Alert>
        )}
      </Modal.Body>

      {/* Footer del Modale (Bottoni di Azione) */}
      <Modal.Footer>
        <Button
          variant='secondary'
          onClick={handleClose}
          // Non permettere la chiusura se l'ordine è in elaborazione
          disabled={isProcessing}
        >
          Annulla
        </Button>

        <Button
          variant='success'
          onClick={onConfirmPurchase}
          // Disabilita se manca un indirizzo O se l'ordine è in elaborazione
          disabled={!hasAddresses || !selectedAddressId || isProcessing}
        >
          {/* Mostra lo spinner durante l'elaborazione */}
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
