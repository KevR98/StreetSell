import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function BackButton({
  label = '← Torna Indietro',
  variant = 'secondary',
  className = 'mb-4',
}) {
  const navigate = useNavigate();
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => navigate(-1)}
    >
      {label}
    </Button>
  );
}

export default BackButton;
