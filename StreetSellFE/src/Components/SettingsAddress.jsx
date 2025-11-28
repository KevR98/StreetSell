import { Card, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import Indirizzo from './Indirizzo';

/**
 * Componente per la visualizzazione e la gestione degli indirizzi di spedizione salvati dall'utente.
 * Permette di aggiungere, visualizzare e eliminare indirizzi.
 */
function SettingsAddress({
  addresses, // Array degli indirizzi di spedizione
  loadingAddresses, // Stato di caricamento degli indirizzi
  isAddingNewAddr, // Stato booleano che indica se il modulo di aggiunta è aperto
  setIsAddingNewAddr, // Funzione per gestire l'apertura/chiusura del modulo di aggiunta
  handleDeleteAddress, // Funzione del genitore per l'eliminazione di un indirizzo
  fetchUserAddresses, // Funzione del genitore per ricaricare la lista degli indirizzi
  token, // Token di autenticazione per il componente Indirizzo
  brandColor, // Colore del brand
}) {
  return (
    <Card className='border-0' style={{ background: 'transparent' }}>
      {/* PADDING RESPONSIVE: p-2 su mobile, p-4 su desktop */}
      <Card.Body className='p-2 p-md-4'>
        <div className='d-flex justify-content-between align-items-center mb-4'>
          {/* Titolo Sezione */}
          <h4 className='m-0 fs-5 fs-md-4'>Indirizzi di Spedizione</h4>

          {/* Bottone Aggiungi Nuovo (Nascosto se il modulo di aggiunta è già aperto) */}
          {!isAddingNewAddr && (
            <Button
              style={{ backgroundColor: brandColor, borderColor: brandColor }}
              size='sm'
              className='fs-7-custom fs-md-6'
              onClick={() => setIsAddingNewAddr(true)}
            >
              + Aggiungi Nuovo
            </Button>
          )}
        </div>

        {loadingAddresses && <LoadingSpinner />}

        {isAddingNewAddr ? (
          // Vista Modulo Aggiunta Indirizzo
          <div className='bg-light p-3 rounded'>
            <h5 className='mb-3 fs-6 fs-md-5'>Nuovo Indirizzo</h5>
            <Indirizzo
              token={token}
              // Al successo dell'aggiunta: ricarica la lista e chiude il modulo
              onAddressAdded={() => {
                fetchUserAddresses();
                setIsAddingNewAddr(false);
              }}
              // Al click su Annulla: chiude il modulo
              onCancel={() => setIsAddingNewAddr(false)}
            />
          </div>
        ) : (
          // Vista Lista Indirizzi
          <ListGroup variant='flush'>
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <ListGroup.Item
                  key={addr.id}
                  // PADDING LISTA RESPONSIVE (px-0 su mobile)
                  className='d-flex justify-content-between align-items-center py-3 px-0 px-md-3'
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className='me-2'>
                    {/* Via e Civico */}
                    <div className='fw-bold fs-7-custom fs-md-6'>
                      {addr.via}, {addr.civico}
                    </div>

                    {/* Città, CAP, Provincia, Nazione */}
                    <div className='text-muted fs-8-custom fs-md-7'>
                      {addr.cap} {addr.citta} ({addr.provincia}), {addr.nazione}
                    </div>

                    {/* Badge Predefinito (se necessario) */}
                    {addr.isDefault && (
                      <Badge bg='success' className='mt-1 fs-8-custom'>
                        Predefinito
                      </Badge>
                    )}
                  </div>

                  {/* Bottone Elimina */}
                  <Button
                    variant='outline-danger'
                    size='sm'
                    onClick={() => handleDeleteAddress(addr.id)}
                    className='d-flex align-items-center justify-content-center'
                    style={{ height: '32px', width: '32px' }} // Bottone quadrato compatto
                  >
                    <FaTrash size={12} />
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              // Messaggio se non ci sono indirizzi
              <Alert variant='info' className='fs-7-custom fs-md-6'>
                Non hai ancora salvato nessun indirizzo.
              </Alert>
            )}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default SettingsAddress;
