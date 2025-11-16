import { useEffect, useState } from 'react';
import { Button, Carousel, Col, Container, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8888/prodotti';

function Details() {
  const [prodotto, setProdotto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { prodottoId } = useParams();

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
      <Link to='/' className='btn btn-secondary mb-4'>
        ← Torna alla lista
      </Link>

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

        {/* COLONNA INFORMAZIONI */}
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

          <Button variant='success' size='lg'>
            Acquista Ora
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Details;
