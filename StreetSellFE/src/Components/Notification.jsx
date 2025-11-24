import { useEffect, useState } from 'react';
import { NavDropdown, Badge, Spinner } from 'react-bootstrap';
import {
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaBell,
  FaTimesCircle,
  FaCheckCircle,
} from 'react-icons/fa'; // 🛑 AGGIUNTE ICONE
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const MANAGEMENT_ENDPOINT = 'http://localhost:8888/ordini/gestione';
const POLLING_INTERVAL = 30000;

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const currentUser = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('accessToken');

  const fetchNotifications = async () => {
    setIsLoading(true);
    let allNotifications = [];

    const headers = { Authorization: `Bearer ${token}` };
    const currentUserId = currentUser?.id;

    try {
      const resManagement = await fetch(MANAGEMENT_ENDPOINT, { headers });

      if (!resManagement.ok) {
        throw new Error('Errore nel caricamento delle task unificate.');
      }

      const ordiniGestione = await resManagement.json();

      if (Array.isArray(ordiniGestione)) {
        ordiniGestione.forEach((order) => {
          const isUserVendor = order.venditore?.id === currentUserId;
          const isUserBuyer = order.compratore?.id === currentUserId;

          // Nomi utente per i messaggi
          const compratoreUsername = order.compratore?.username || 'Un utente';
          const venditoreUsername = order.venditore?.username || 'Il venditore';
          const prodottoTitolo = order.prodotto?.titolo || 'Prodotto N/D';

          // ------------------------------------------------------------------
          // 🛑 LOGICA NOTIFICHE VENDITORE (Acquisto, Annullamento, Completamento)
          // ------------------------------------------------------------------
          if (isUserVendor) {
            if (
              order.statoOrdine === 'CONFERMATO' ||
              order.statoOrdine === 'IN_ATTESA'
            ) {
              // Task Venditore: Acquisto effettuato (richiede spedizione)
              allNotifications.push({
                id: order.id,
                type: 'VENDITORE_ACQUISTO', // Nuovo tipo più specifico
                message: `🎉 ${compratoreUsername} ha comprato: ${prodottoTitolo}. Spedisci subito!`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'ANNULLATO') {
              // 🛑 Notifica Venditore: Ordine Annullato
              allNotifications.push({
                id: order.id + '-annull',
                type: 'VENDITORE_ANNULLATO',
                message: `❌ Attenzione! ${compratoreUsername} ha annullato l'ordine per ${prodottoTitolo}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            } else if (order.statoOrdine === 'COMPLETATO') {
              // Task Venditore: Completato (notifica di chiusura)
              allNotifications.push({
                id: order.id + '-vend-comp',
                type: 'VENDITORE_COMPLETATO',
                message: `🎉 ${compratoreUsername} ha confermato la ricezione di ${prodottoTitolo}. Ordine Completato!`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            }
          }

          // ------------------------------------------------------------------
          // 🛑 LOGICA NOTIFICHE COMPRATORE (Spedizione, Altro)
          // ------------------------------------------------------------------
          if (isUserBuyer) {
            if (order.statoOrdine === 'SPEDITO') {
              // Task Compratore: Conferma Arrivo
              allNotifications.push({
                id: order.id + '-comp',
                type: 'COMPRATORE_SPEDITO', // Nuovo tipo
                message: `🚚 Ottime notizie! ${venditoreUsername} ha spedito il tuo ordine: ${prodottoTitolo}.`,
                date: new Date(order.dataOrdine),
                prodottoId: order.prodotto?.id,
              });
            }
            // Non servono notifiche ANNULLATO per il compratore, perché è lui stesso ad annullare.
          }
        });
      }

      // 2. Ordina e imposta il conteggio totale dalla lista
      allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());

      setTotalCount(allNotifications.length);
      setNotifications(allNotifications.slice(0, 5));
    } catch (error) {
      console.error('Errore fetch notifiche:', error);
      setNotifications([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 🛑 NUOVA LOGICA: AZZERA LO STATO AL LOGOUT
    if (!token || !currentUser) {
      // Interrompiamo il Polling se era attivo
      // Resettiamo gli stati per non mostrare le vecchie notifiche
      setNotifications([]);
      setTotalCount(0);
      setIsLoading(false);
      return; // Non procedere con il fetch
    }

    // Se l'utente è loggato, avvia il fetching e il polling
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    // Cleanup: interrompe il polling quando il componente viene smontato o le dipendenze cambiano
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser]);

  if (!currentUser || !token) return null;

  const titleContent = (
    <div className='d-flex align-items-center position-relative'>
      <FaBell size={20} className='me-2' />
      {totalCount > 0 && (
        <Badge
          bg='danger'
          pill
          className='position-absolute top-0 start-100 translate-middle ms-1'
        >
          {isLoading ? (
            <Spinner animation='border' size='sm' className='p-0 m-0' />
          ) : (
            totalCount
          )}
        </Badge>
      )}
    </div>
  );

  return (
    <NavDropdown
      title={titleContent}
      id='notifications-dropdown'
      align='end'
      className='me-3 no-caret'
    >
      {isLoading && <NavDropdown.ItemText>Caricamento...</NavDropdown.ItemText>}

      {!isLoading && totalCount === 0 && (
        <NavDropdown.ItemText>Nessuna notifica in attesa.</NavDropdown.ItemText>
      )}

      {/* Mappa gli ordini recenti nella tendina */}
      {notifications.map((notif) => (
        <NavDropdown.Item
          key={notif.id}
          as={Link}
          // Venditore va alla gestione per task/annullato, Compratore ai dettagli prodotto
          to={
            notif.type.startsWith('VENDITORE')
              ? '/ordini/gestione'
              : `/prodotto/${notif.prodottoId}`
          }
          className='small'
        >
          {/* 🛑 LOGICA ICONE AGGIORNATA */}
          {notif.type === 'VENDITORE_ACQUISTO' ? (
            <FaShoppingCart className='text-success me-2' /> // Task da Spedire
          ) : notif.type === 'COMPRATORE_SPEDITO' ? (
            <FaTruck className='text-primary me-2' /> // Task da Confermare
          ) : notif.type === 'VENDITORE_ANNULLATO' ? (
            <FaTimesCircle className='text-danger me-2' /> // Ordine Annullato
          ) : (
            <FaCheckCircle className='text-info me-2' /> // Completato (default)
          )}
          {notif.message}
          <span className='d-block text-muted' style={{ fontSize: '0.75rem' }}>
            {notif.date.toLocaleTimeString()}
          </span>
        </NavDropdown.Item>
      ))}

      {totalCount > 0 && <NavDropdown.Divider />}

      {/* Link che porta alla lista completa degli ordini da gestire */}
      {totalCount > 0 && (
        <NavDropdown.Item
          as={Link}
          to='/ordini/gestione'
          className='text-primary text-center'
        >
          Vedi tutti gli ordini da gestire ({totalCount})
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );
}

export default Notification;
