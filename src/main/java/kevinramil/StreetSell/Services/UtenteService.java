package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.UpdateUtenteDTO;
import kevinramil.StreetSell.Payloads.UtenteAdminDTO;
import kevinramil.StreetSell.Repositories.ProdottoRepository;
import kevinramil.StreetSell.Repositories.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UtenteService {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private ProdottoRepository prodottoRepository;

    public List<Utente> findAllActive() {
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


    public List<UtenteAdminDTO> findAllAdmin() {
        List<Utente> utenti = utenteRepository.findAll();

        return utenti.stream()
                .map(u -> {
                    // 🛑 CORREZIONE: Passa l'ID dell'utente (u.getId()) al Repository.
                    long count = prodottoRepository.countByVenditoreAndStatoProdotto(u.getId());

                    return UtenteAdminDTO.fromUtente(u, count);
                })
                .collect(Collectors.toList());
    }


    public Utente riattivaUtente(UUID utenteId) {
        // Cerchiamo l'utente usando il repository direttamente,
        // in modo da poter trovare anche gli account inattivi (soft-deleted).
        Utente utenteDaRiattivare = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new NotFoundException("Utente con ID " + utenteId + " non trovato."));

        // Controlla se l'utente è già attivo (opzionale)
        if (utenteDaRiattivare.getAttivo()) {
            throw new BadRequestException("L'utente è già attivo.");
        }

        // Imposta lo stato su attivo
        utenteDaRiattivare.setAttivo(true);

        return utenteRepository.save(utenteDaRiattivare); // Salva la modifica
    }

    @Transactional
    public Utente updateProfileDetails(UpdateUtenteDTO payload, Utente utenteCorrente) {

        // Applica le modifiche. Dato che i campi sono nullable nel DB,
        // possiamo accettare i valori dal DTO. Se il DTO è @Validated e @NotEmpty,
        // questi valori non saranno mai null qui, ma saranno gestiti dalla Validation.
        utenteCorrente.setNome(payload.nome());
        utenteCorrente.setCognome(payload.cognome());

        // Nota: se volessi aggiornare altri campi (es. email), lo faresti qui.

        // Salva l'oggetto aggiornato.
        return utenteRepository.save(utenteCorrente);
    }
}