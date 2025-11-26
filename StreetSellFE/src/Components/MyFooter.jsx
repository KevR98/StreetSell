import { Link } from 'react-router-dom';

function MyFooter() {
  // Ho aggiunto una variabile colore per rendere più facile l'override del colore della linea, se volessi usare il brand color
  const ACCENT_COLOR = '#7c4dff';
  const BRAND_COLOR = '#fa8229'; // Colore del tuo brand, se necessario

  return (
    // ✅ Nasconde il footer sui dispositivi XS e SM, lo mostra da MD in su
    <footer className='bg-dark text-white pt-4 pb-2 d-none d-md-block'>
      <div className='container text-center text-md-start'>
        <div className='row'>
          {/* DESCRIZIONE */}
          <div className='col-md-4 col-lg-4 col-xl-4 mx-auto mb-4'>
            {/* ✅ fs-6 su MD/Tablet, fs-5 su LG/Desktop */}
            <h6 className='text-uppercase fw-bold fs-6 fs-lg-5'>Street Sell</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: ACCENT_COLOR,
                height: '2px',
              }}
            />
            {/* ✅ fs-7 su MD/Tablet (assumendo classe custom), fs-6 su LG/Desktop */}
            <p className='fs-7 fs-lg-6'>
              La tua piazza di mercato online per trovare le migliori offerte
              direttamente dalla strada.
            </p>
          </div>

          {/* LINK UTILI */}
          <div className='col-md-4 col-lg-2 col-xl-2 mx-auto mb-4'>
            <h6 className='text-uppercase fw-bold fs-6 fs-lg-5'>Link Utili</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: ACCENT_COLOR,
                height: '2px',
              }}
            />
            <div className='fs-7 fs-lg-6'>
              <p>
                <Link to='/about' className='text-white'>
                  Chi Siamo
                </Link>
              </p>
              <p>
                <Link to='/termini' className='text-white'>
                  Termini di Servizio
                </Link>
              </p>
              <p>
                <Link to='/privacy' className='text-white'>
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* CONTATTI E SOCIAL */}
          <div className='col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4'>
            <h6 className='text-uppercase fw-bold fs-6 fs-lg-5'>Contatti</h6>
            <hr
              className='mb-4 mt-0 d-inline-block mx-auto'
              style={{
                width: '60px',
                backgroundColor: ACCENT_COLOR,
                height: '2px',
              }}
            />
            <div className='fs-7 fs-lg-6'>
              <p>
                <i className='bi bi-geo-alt-fill me-3'></i> Milano, IT
              </p>
              <p>
                <i className='bi bi-envelope-fill me-3'></i> info@streetsell.com
              </p>
            </div>

            {/* Icone Social */}
            <div className='mt-4'>
              {/* Le icone si rimpiccioliscono in modalità tablet */}
              <a href='#!' className='text-white me-4 fs-5 fs-lg-4'>
                <i className='bi bi-facebook'></i>
              </a>
              <a href='#!' className='text-white me-4 fs-5 fs-lg-4'>
                <i className='bi bi-twitter'></i>
              </a>
              <a href='#!' className='text-white me-4 fs-5 fs-lg-4'>
                <i className='bi bi-instagram'></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div
        // Anche il copyright si rimpicciolisce
        className='text-center p-3 fs-7 fs-lg-6'
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
