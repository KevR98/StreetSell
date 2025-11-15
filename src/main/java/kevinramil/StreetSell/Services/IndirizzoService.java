package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Indirizzo;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.IndirizzoDTO;
import kevinramil.StreetSell.Repositories.IndirizzoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class IndirizzoService {
    @Autowired
    private IndirizzoRepository indirizzoRepository;

    // Metodo per creare un nuovo indirizzo
    public Indirizzo aggiungiIndirizzo(IndirizzoDTO indirizzoDTO, Utente utente) {

        // Creo l'oggetto vuoto
        Indirizzo newIndirizzo = new Indirizzo();

        // Riempio i dati forniti dall'utente
        newIndirizzo.setVia(indirizzoDTO.via());
        newIndirizzo.setCitta(indirizzoDTO.citta());
        newIndirizzo.setCap(indirizzoDTO.cap());
        newIndirizzo.setProvincia(indirizzoDTO.provincia());
        newIndirizzo.setNazione(indirizzoDTO.nazione());

        // Assegno l'indirizzo all'utente che l'ha creato
        newIndirizzo.setUtente(utente);

        // Ritorno l'indirizzo nel db
        return indirizzoRepository.save(newIndirizzo);
    }

    // Metodo per ottenere gli indirizzi di un'utente
    public List<Indirizzo> getIndirizziPerUtente(Utente utente) {
        // Usiamo il metodo che hai già creato nel repository!
        return indirizzoRepository.findByUtente(utente);
    }

    // Metodo per eliminare un'indirizzo
    public void eliminaIndirizzo(UUID indirizzoId, Utente utente) {
        Indirizzo indirizzoDaCancellare = indirizzoRepository.findById(indirizzoId)
                .orElseThrow(() -> new NotFoundException("Indirizzo con ID " + indirizzoId + " non trovato."));
        
        // Verifico che l'utente che chiede la cancellazione sia il proprietario dell'indirizzo.
        if (!indirizzoDaCancellare.getUtente().getId().equals(utente.getId())) {
            throw new BadRequestException("Non hai i permessi per eliminare l'indirizzo di un altro utente.");
        }

        indirizzoRepository.delete(indirizzoDaCancellare);
    }
}
