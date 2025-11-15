package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Repositories.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UtenteService {

    @Autowired
    private UtenteRepository utenteRepository;

    public List<Utente> findAll() {
        // MODIFICA: Filtra la lista per restituire solo gli utenti attivi.
        return utenteRepository.findAll().stream()
                .filter(Utente::getAttivo)
                .collect(Collectors.toList());
    }

    public Utente findById(UUID id) {
        // Questa ricerca va bene, ma aggiungiamo un controllo per coerenza
        Utente utente = utenteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utente con ID " + id + " non trovato"));

        if (!utente.getAttivo()) {
            // Se l'utente non è attivo, lancia comunque un'eccezione per non esporre dati
            throw new NotFoundException("Utente con ID " + id + " non trovato o disattivato");
        }
        return utente;
    }


    // MODIFICA: Rinominato e corretto il metodo per l'admin.
    // Ora imposta l'utente come inattivo invece di cancellarlo (Soft Delete).
    public void disattivaUtente(UUID utenteId) {
        // Usiamo il repository direttamente qui per poter "vedere" anche gli utenti non attivi
        // ed eventualmente riattivarli in futuro.
        Utente utenteDaDisattivare = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new NotFoundException("Utente con ID " + utenteId + " non trovato"));
        utenteDaDisattivare.setAttivo(false); // Imposta lo stato a non attivo
        utenteRepository.save(utenteDaDisattivare); // Salva la modifica
    }

    // QUESTO METODO È GIÀ CORRETTO!
    // Metodo dove è l'utente stesso a voler disattivare il proprio account
    public void disattivaMioAccount(Utente utente) {
        utente.setAttivo(false);
        utenteRepository.save(utente);
    }
}