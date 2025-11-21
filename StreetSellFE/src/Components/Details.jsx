import { useEffect, useState } from 'react';
import { Alert, Button, Carousel, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8888/prodotti';

function Details() {
  const [prodotto, setProdotto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { prodottoId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(endpoint + '/' + prodottoId)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Errore nel caricamento');
        }
      })

      .then((prodottoDetail) => {
        console.log(prodottoDetail);
        setIsLoading(false);
        setError(false);
        setProdotto(prodottoDetail);
      })

      .catch((err) => {
        console.log('Errore nel caricamento', err);
        setIsLoading(true);
        setError(true);
      });
  }, [prodottoId]);

  const handleDelete = () => {
    // Semplice conferma browser (puoi usare un Modal Bootstrap per farlo più bello)
    if (
      window.confirm(
        'Sei sicuro di voler eliminare definitivamente questo annuncio?'
      )
    ) {
      fetch(endpoint + '/' + prodottoId, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`, // Fondamentale: Token per autorizzare
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.ok) {
            alert('Prodotto eliminato con successo!');
            navigate('/prodotti/me'); // Reindirizza ai miei prodotti
          } else {
            alert("C'è stato un errore durante l'eliminazione.");
          }
        })
        .catch((err) => {
          console.error('Errore:', err);
          setIsLoading(false);
          setError(true);
        });
    }
  };

  if (isLoading) {
    return (
      <Container className='text-center my-5'>
        Caricamento in corso...
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='alert alert-danger my-5'>Errore: {error}</Container>
    );
  }

  if (!prodotto) {
    return (
      <Container className='text-center my-5'>
        Nessun prodotto da visualizzare.
      </Container>
    );
  }

  const isOwner =
    currentUser &&
    prodotto.venditore &&
    currentUser.id === prodotto.venditore.id;

  const isAdmin = currentUser && currentUser.ruolo === 'ADMIN';

  const canModerate = isOwner || isAdmin;

  const canBuy =
    !isOwner && !isAdmin && prodotto.statoProdotto === 'DISPONIBILE';

  // Logica per le immagini
  const immaginiCarousel =
    prodotto.immagini && prodotto.immagini.length > 0
      ? prodotto.immagini
      : [
          {
            url: 'https://via.placeholder.com/600x400?text=Immagine+Non+Disponibile',
            id: 'placeholder-0',
          },
        ];

  return (
    <Container className='my-5'>
      <Button variant='secondary' className='mb-4' onClick={() => navigate(-1)}>
        ← Torna Indietro
      </Button>

      <Row>
        {/* COLONNA IMMAGINI */}
        <Col md={6}>
          <Carousel interval={null} indicators={false}>
            {immaginiCarousel.map((img, index) => (
              <Carousel.Item key={img.id || index}>
                <img
                  className='d-block w-100 rounded shadow'
                  src={img.url}
                  alt={`${prodotto.titolo} - ${index}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6} className='pt-4 pt-md-0'>
          <h1 className='display-4'>{prodotto.titolo}</h1>
          <p className='lead text-primary fw-bold'>
            € {prodotto.prezzo.toFixed(2)}
          </p>

          <hr />

          <h2>Descrizione</h2>
          <p>{prodotto.descrizione}</p>

          <ul className='list-unstyled mb-4'>
            <li>
              **Venditore:**{' '}
              {prodotto.venditore ? prodotto.venditore.username : 'N/D'}
            </li>
            <li>**Condizione:** {prodotto.condizione}</li>
            <li>**Categoria:** {prodotto.categoria}</li>
          </ul>
          {canModerate ? (
            // 1. Se è PROPRIETARIO o ADMIN: Mostra SEMPRE i bottoni Modifica/Elimina
            <div className='d-flex gap-3'>
              {/* Bottone Modifica: Porta alla pagina di modifica */}
              <Link
                to={`/modifica-prodotto/${prodotto.id}`}
                className='btn btn-warning btn-lg flex-grow-1'
              >
                ✏️ Modifica
              </Link>

              {/* Bottone Elimina: Scatena la funzione handleDelete */}
              <Button
                variant='danger'
                size='lg'
                className='flex-grow-1'
                onClick={handleDelete}
              >
                🗑️ Elimina
              </Button>
            </div>
          ) : canBuy ? (
            // 2. Se NON è proprietario/admin E DISPONIBILE: Mostra Acquista
            <Button variant='success' size='lg' className='w-100'>
              Acquista Ora
            </Button>
          ) : (
            // 3. Altrimenti (NON proprietario/admin E NON disponibile): Mostra non disponibile
            <Button variant='secondary' size='lg' className='w-100' disabled>
              Non Disponibile
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Details;
