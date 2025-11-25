import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Il componente riceve un oggetto 'prodotto' come "prop" (proprietà)
function ProductCard({ prodotto }) {
  // Controllo di sicurezza: se 'prodotto' è nullo o non definito, non mostrare nulla.
  if (!prodotto) {
    return null;
  }

  // Logica per preparare le immagini:
  // Se non ci sono immagini, usiamo un array contenente solo il placeholder.
  const immaginiCarousel =
    prodotto.immagini && prodotto.immagini.length > 0
      ? prodotto.immagini
      : [
          {
            urlImmagine:
              'https://via.placeholder.com/300x200?text=Annuncio+StreetSell',
            // ID fittizio per la chiave React, se non c'è l'immagine reale
            id: 'placeholder-0',
          },
        ];

  const primaImmagineUrl =
    immaginiCarousel[0].urlImmagine || immaginiCarousel[0].url;

  const shortDescription =
    prodotto.descrizione && prodotto.descrizione.length > 80
      ? prodotto.descrizione.substring(0, 80) + '...'
      : prodotto.descrizione;

  const displayCondizione = (condizione) => {
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

  const TWENTY_MINUTES = 20 * 60 * 1000;

  const getDisplayDate = (createdAt) => {
    if (!createdAt) {
      return 'Data non disponibile';
    }

    const createdDate = new Date(createdAt);
    const now = Date.now();
    const diff = now - createdDate.getTime();
    if (diff <= TWENTY_MINUTES) {
      // Logica 'Minuti fa'
      const minutes = Math.floor(diff / (60 * 1000));
      if (minutes === 0) return ' ora';
      return ` ${minutes} minuti fa`;
    }
    const datePart = createdDate.toLocaleDateString('it-IT');

    return `${datePart}`;
  };

  const formattedDate = getDisplayDate(prodotto.createdAt);

  return (
    <Link
      as={Link}
      to={`/prodotto/${prodotto.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card
        className='h-100 border-0'
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          style={{
            width: '100%',
            height: '400px',
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
              // Centratura opzionale per coerenza con il vecchio stile
              display: 'block',
            }}
          />
        </div>

        {/* Corpo della Card */}
        <Card.Body className='d-flex flex-column p-2'>
          <div className='mb-2'>
            {/* Titolo: Normale ma in grassetto, come richiesto */}
            <Card.Title className='mb-1 fw-bold' style={{ fontSize: '1em' }}>
              {prodotto.titolo}
            </Card.Title>

            {/* Descrizione (lascia che Bootstrap gestisca il wrap) */}
            <Card.Text className='mb-1 small text-muted'>
              Descrizione: {shortDescription}
            </Card.Text>

            {/* Condizione */}
            <Card.Text className='mb-1 small'>
              {displayCondizione(prodotto.condizione)}
            </Card.Text>
          </div>
          <div className='mt-auto d-flex justify-content-between align-items-end'>
            <Card.Text className='mb-0 fw-bold' style={{ fontSize: '0.9em' }}>
              {prodotto.prezzo ? parseFloat(prodotto.prezzo).toFixed(2) : 'N/D'}{' '}
              €
            </Card.Text>
            <Card.Text
              className='text-secondary mb-0'
              style={{ fontSize: '0.75em' }}
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
