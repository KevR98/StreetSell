import { Link } from 'react-router-dom';

function MyFooter() {
  return (
    <footer className='bg-dark text-white pt-4 pb-2'>
      <div className='container text-center text-md-start'>
        <div className='row'>
          {/* COLONNA 1: DESCRIZIONE */}
          <div className='col-md-4 col-lg-4 col-xl-4 mx-auto mb-4'>
            <h6 className='text-uppercase fw-bold'>Street Sell</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: '#7c4dff',
                height: '2px',
              }}
            />
            <p>
              La tua piazza di mercato online per trovare le migliori offerte
              direttamente dalla strada.
            </p>
          </div>

          {/* COLONNA 2: LINK UTILI */}
          <div className='col-md-4 col-lg-2 col-xl-2 mx-auto mb-4'>
            <h6 className='text-uppercase fw-bold'>Link Utili</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: '#7c4dff',
                height: '2px',
              }}
            />
            <p>
              <a to='/about' className='text-white'>
                Chi Siamo
              </a>
            </p>
            <p>
              <a to='/termini' className='text-white'>
                Termini di Servizio
              </a>
            </p>
            <p>
              <a to='/privacy' className='text-white'>
                Privacy Policy
              </a>
            </p>
          </div>

          {/* COLONNA 3: CONTATTI E SOCIAL */}
          <div className='col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4'>
            <h6 className='text-uppercase fw-bold'>Contatti</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: '#7c4dff',
                height: '2px',
              }}
            />
            <p>
              <i className='bi bi-geo-alt-fill me-3'></i> Milano, IT
            </p>
            <p>
              <i className='bi bi-envelope-fill me-3'></i> info@streetsell.com
            </p>
            {/* Icone Social */}
            <div className='mt-4'>
              <a href='#!' className='text-white me-4 fs-4'>
                <i className='bi bi-facebook'></i>
              </a>
              <a href='#!' className='text-white me-4 fs-4'>
                <i className='bi bi-twitter'></i>
              </a>
              <a href='#!' className='text-white me-4 fs-4'>
                <i className='bi bi-instagram'></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div
        className='text-center p-3'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      >
        © {new Date().getFullYear()} Copyright:
        <a className='text-white fw-bold' href='https://streetsell.com/'>
          {' '}
          StreetSell.com
        </a>
      </div>
    </footer>
  );
}

export default MyFooter;
