import React, { useEffect, useState, useCallback } from 'react';
import { NavDropdown, Badge, Spinner, Button, Dropdown } from 'react-bootstrap';
import { FaTruck, FaShoppingCart, FaBell, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importato useNavigate

const MANAGEMENT_ENDPOINT = 'http://localhost:8888/ordini/gestione';
const STORAGE_KEY = 'hidden_notification_ids';
const POLLING_INTERVAL = 30000;

// ✅ TOGGLE CUSTOM PER MOBILE
const MobileNotificationToggle = React.forwardRef(
  ({ onClick, icon, count }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        color: 'white',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon || <FaBell size={20} />}
        {count > 0 && (
          <Badge
            pill
            bg='danger'
            className='position-absolute top-0 start-100 translate-middle'
            style={{
              fontSize: '0.65rem',
              padding: '0.15em 0.4em',
              lineHeight: '1',
              zIndex: 10,
            }}
          >
            {count > 9 ? '9+' : count}
          </Badge>
        )}
      </div>
    </div>
  )
);

function Notification({ isMobile = false, icon }) {
  const navigate = useNavigate(); // 2. Definito useNavigate (FONDAMENTALE)
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  const getStorageKey = useCallback((userId) => {
    return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  }, []);

  const loadHiddenIds = useCallback(
    (userId) => {
      const key = getStorageKey(userId);
      const storedIds = localStorage.getItem(key);
      if (storedIds) {
        setHiddenIds(new Set(JSON.parse(storedIds)));
      }
      setIsStorageLoaded(true);
    },
    [getStorageKey]
  );

  const saveHiddenIds = useCallback(
    (ids, userId) => {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(Array.from(ids)));
    },
    [getStorageKey]
  );

  const fetchNotifications = useCallback(async () => {
    if (!token || !currentUser || !isStorageLoaded) return;

    try {
      const res = await fetch(MANAGEMENT_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Errore nel caricamento delle notifiche');
      }

      const data = await res.json();
      const allOrders = Array.isArray(data) ? data : [];

      const newNotifications = allOrders
        .filter(
          (order) =>
            order.statoOrdine !== 'COMPLETATO' &&
            order.statoOrdine !== 'ANNULLATO'
        )
        .map((order) => ({
          id: order.id,
          type: order.statoOrdine,
          prodotto: order.prodotto.titolo,
          orderId: order.id,
          data: new Date(order.dataOrdine),
        }));

      newNotifications.sort((a, b) => b.data - a.data);

      setNotifications(newNotifications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, isStorageLoaded]);

  useEffect(() => {
    if (currentUser) {
      loadHiddenIds(currentUser.id);
    } else {
      setIsStorageLoaded(true);
    }
  }, [currentUser, loadHiddenIds]);

  useEffect(() => {
    if (isStorageLoaded && currentUser && token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [token, currentUser, isStorageLoaded, fetchNotifications]);

  const hideNotification = (id) => {
    const newHiddenIds = new Set(hiddenIds);
    newHiddenIds.add(id);
    setHiddenIds(newHiddenIds);
    saveHiddenIds(newHiddenIds, currentUser.id);
  };

  const clearAllNotifications = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setHiddenIds(allIds);
    saveHiddenIds(allIds, currentUser.id);
  };

  const formatNotificationMessage = (notif) => {
    let iconRender, message, variant;

    switch (notif.type) {
      case 'IN_PREPARAZIONE':
        iconRender = <FaShoppingCart className='text-info me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è in preparazione.`;
        variant = 'info';
        break;
      case 'IN_SPEDIZIONE':
        iconRender = <FaTruck className='text-primary me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è in spedizione.`;
        variant = 'primary';
        break;
      case 'CONSEGNATO':
        iconRender = <FaCheckCircle className='text-success me-2' />;
        message = `Ordine #${notif.orderId} (Prodotto: ${notif.prodotto}) è stato consegnato!`;
        variant = 'success';
        break;
      default:
        iconRender = <FaBell className='text-secondary me-2' />;
        message = `Nuova notifica: ${notif.prodotto}.`;
        variant = 'secondary';
    }

    const timeAgo = Math.floor((new Date() - notif.data) / (1000 * 60));
    let timeText;
    if (timeAgo < 1) {
      timeText = 'Ora';
    } else if (timeAgo < 60) {
      timeText = `${timeAgo}m fa`;
    } else if (timeAgo < 1440) {
      timeText = `${Math.floor(timeAgo / 60)}h fa`;
    } else {
      timeText = `${Math.floor(timeAgo / 1440)}g fa`;
    }

    return { iconRender, message, timeText, variant };
  };

  const visibleNotifications = notifications.filter(
    (notif) => !hiddenIds.has(notif.id)
  );

  const titleContent = (
    <div className='d-flex align-items-center'>
      <FaBell size={20} className='me-2' />
      Notifiche
      {visibleNotifications.length > 0 && (
        <Badge pill bg='danger' className='ms-2'>
          {visibleNotifications.length > 9 ? '9+' : visibleNotifications.length}
        </Badge>
      )}
    </div>
  );

  const renderDropdownItems = () => (
    <>
      {isLoading ? (
        <Dropdown.ItemText className='text-center'>
          <Spinner animation='border' size='sm' /> Caricamento...
        </Dropdown.ItemText>
      ) : visibleNotifications.length === 0 ? (
        <Dropdown.ItemText className='text-center text-muted'>
          Nessuna notifica.
        </Dropdown.ItemText>
      ) : (
        visibleNotifications.slice(0, 5).map((notif) => {
          const { iconRender, message, timeText } =
            formatNotificationMessage(notif);
          return (
            <Dropdown.Item
              key={notif.id}
              className='d-flex justify-content-between align-items-start dropdown-item-custom'
              as='div'
              style={{ cursor: 'pointer' }} // Aggiunto style per feedback visivo
              onClick={() => navigate(`/ordini/gestione`)} // Ora navigate funziona
            >
              <div className='d-flex flex-column me-2'>
                <div className='small fw-bold text-wrap'>
                  {iconRender}
                  {message}
                </div>
                <div className='text-muted' style={{ fontSize: '0.75rem' }}>
                  {timeText}
                </div>
              </div>
              <Button
                variant='link'
                size='sm'
                className='ms-auto text-muted p-0'
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  hideNotification(notif.id);
                }}
              >
                &times;
              </Button>
            </Dropdown.Item>
          );
        })
      )}

      {visibleNotifications.length > 0 && <Dropdown.Divider />}

      {visibleNotifications.length > 0 && (
        <Dropdown.ItemText className='text-center d-flex justify-content-between align-items-center p-2'>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={clearAllNotifications}
          >
            Cancella
          </Button>
          {/* Link funziona sempre perché è importato */}
          <Link to='/ordini/gestione' className='btn btn-link btn-sm'>
            Gestione
          </Link>
        </Dropdown.ItemText>
      )}
    </>
  );

  // 📱 RENDER MOBILE
  if (isMobile) {
    return (
      <Dropdown drop='up' align='end'>
        <Dropdown.Toggle
          as={MobileNotificationToggle}
          icon={icon}
          count={visibleNotifications.length}
          id='dropdown-mobile-notifications'
        />
        <Dropdown.Menu className='shadow border-0'>
          {renderDropdownItems()}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // 💻 RENDER DESKTOP
  return (
    <NavDropdown
      title={titleContent}
      id='notifications-dropdown'
      align='end'
      className='me-3 no-caret'
    >
      {renderDropdownItems()}
    </NavDropdown>
  );
}

export default Notification;
