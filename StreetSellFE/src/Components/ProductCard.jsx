import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Componente per visualizzare un'anteprima compatta di un prodotto in vendita.
 * La card è un link cliccabile che reindirizza ai dettagli del prodotto.
 */
function ProductCard({ prodotto }) {
  // Controllo di sicurezza: se 'prodotto' è nullo, non renderizzare nulla.
  if (!prodotto) {
    return null;
  }

  // URL di fallback per l'immagine se non è disponibile
  const placeholderImageUrl =
    'https://via.placeholder.com/300x200?text=Annuncio+StreetSell';

  // Logica per determinare l'URL della prima immagine:
  // Prende la prima immagine dall'array se esiste, altrimenti usa il placeholder.
  const primaImmagineUrl =
    (prodotto.immagini &&
      prodotto.immagini.length > 0 &&
      (prodotto.immagini[0].urlImmagine || prodotto.immagini[0].url)) ||
    placeholderImageUrl;

  // Accorcia la descrizione a 80 caratteri, aggiungendo i puntini di sospensione.
  const shortDescription =
    prodotto.descrizione && prodotto.descrizione.length > 80
      ? prodotto.descrizione.substring(0, 80) + '...'
      : prodotto.descrizione;

  /**
   * Converte lo stato della condizione in un formato leggibile dall'utente.
   */
  const getDisplayCondizione = (condizione) => {
    switch (condizione) {
      case 'NUOVO':
        return 'Nuovo';
      case 'COME_NUOVO':
        return 'Usato - Come Nuovo';
      case 'BUONO':
        return 'Usato - Buono';
      case 'USATO':
        return 'Usato';
      case 'DANNEGGIATO':
        return 'Usato - Danneggiato';
      default:
        return 'N/D';
    }
  };

  // Costante per definire la finestra temporale per la visualizzazione "minuti fa"
  const TWENTY_MINUTES = 20 * 60 * 1000;

  /**
   * Restituisce la data di pubblicazione formattata (data o "X minuti fa").
   */
  const getDisplayDate = (createdAt) => {
    if (!createdAt) {
      return 'Data non disponibile';
    }

    const createdDate = new Date(createdAt);
    const now = Date.now();
    const diff = now - createdDate.getTime();

    // Se la differenza è inferiore a 20 minuti
    if (diff <= TWENTY_MINUTES) {
      const minutes = Math.floor(diff / (60 * 1000));
      if (minutes === 0) return ' ora';
      return ` ${minutes} minuti fa`;
    }

    // Altrimenti, mostra la data completa
    const datePart = createdDate.toLocaleDateString('it-IT');
    return `${datePart}`;
  };

  const formattedDate = getDisplayDate(prodotto.createdAt);

  return (
    // Link che avvolge l'intera Card
    <Link
      to={`/prodotto/${prodotto.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card
        className='h-100 border-0 product-card-responsive'
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Contenitore Immagine */}
        <div
          className='image-wrapper-responsive'
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: '8px',
            position: 'relative',
          }}
        >
          <img
            src={primaImmagineUrl}
            alt={prodotto.titolo || 'Immagine prodotto'}
            className='w-100 h-100'
            style={{
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Corpo della Card */}
        <Card.Body className='d-flex flex-column p-2'>
          <div className='mb-2'>
            {/* Titolo */}
            <Card.Title className='mb-1 fw-bold fs-6 fs-md-5'>
              {prodotto.titolo}
            </Card.Title>

            {/* Descrizione accorciata */}
            <Card.Text className='mb-1 text-muted fs-7-custom'>
              Descrizione: {shortDescription}
            </Card.Text>

            {/* Condizione */}
            <Card.Text className='mb-1 fs-7-custom'>
              {getDisplayCondizione(prodotto.condizione)}
            </Card.Text>
          </div>

          {/* Sezione Prezzo e Data (allineata in basso) */}
          <div className='mt-auto d-flex justify-content-between align-items-end'>
            {/* PREZZO */}
            <Card.Text
              className='mb-0 fw-bold fs-6 fs-md-5'
              style={{ whiteSpace: 'nowrap' }}
            >
              {prodotto.prezzo ? parseFloat(prodotto.prezzo).toFixed(2) : 'N/D'}{' '}
              €
            </Card.Text>

            {/* DATA DI PUBBLICAZIONE (Nascosta su mobile XS) */}
            <Card.Text
              className='text-secondary mb-0 fs-8-custom d-none d-sm-block'
              style={{ whiteSpace: 'nowrap' }}
            >
              Pubblicato: <strong>{formattedDate}</strong>
            </Card.Text>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default ProductCard;
