import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function BackButton({
  label = '← Torna Indietro',
  variant = 'secondary',
  className = 'mb-4',
}) {
  const navigate = useNavigate();

  return (
    <>
      <style type='text/css'>
        {`
          /* Stile per ridurre il bottone solo su mobile (max-width: 576px) */
          @media (max-width: 576px) {
            .btn-mobile-small {
              padding: 0.25rem 0.5rem !important;
              font-size: 0.75rem !important;
              line-height: 1.5;
              border-radius: 0.2rem;
            }
          }
        `}
      </style>
      <Button
        variant={variant}
        // Aggiungiamo la classe custom 'btn-mobile-small'
        className={`${className} btn-mobile-small`}
        onClick={() => navigate(-1)}
      >
        {label}
      </Button>
    </>
  );
}

export default BackButton;
