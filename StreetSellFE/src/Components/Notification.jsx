import { useEffect, useState } from 'react';
import { Badge, Nav } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const endpoint = 'http://localhost:8888/ordini/notifiche/in-spedizione';
const interval = 30000;

function Notification() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  const getNotification = () => {
    if (!token) return;
    setIsLoading(true);

    fetch(endpoint, {
      headers: {
        Authorization: `Berear ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          res.json();
        } else {
          throw new Error('Errore nella fetch notifiche');
        }
      })

      .then((data) => {
        setCount(data.count || 0);
      })

      .catch((err) => {
        console.log('Errore nel caricamento', err);
        setCount(0);
      })

      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!token) return;
    getNotification();
    const intervalId = setInterval(getNotification, interval);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!currentUser || !token) return null;

  // 4. RENDERING
  const showNotification = count > 0;

  return (
    <Nav.Link
      as={Link}
      to='/ordini/venditore'
      className='position-relative me-3'
    >
      <FaBoxOpen size={20} />
      {showNotification && (
        <Badge
          bg='danger'
          pill
          className='position-absolute top-0 start-100 translate-middle'
        >
          {isLoading ? <LoadingSpinner /> : count}
        </Badge>
      )}
      {/* Mostra il testo solo se non ci sono notifiche e non stiamo caricando */}
      {!showNotification && !isLoading && <span className='ms-1'>Ordini</span>}
    </Nav.Link>
  );
}

export default Notification;
