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
      <style type='text/css'></style>
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
