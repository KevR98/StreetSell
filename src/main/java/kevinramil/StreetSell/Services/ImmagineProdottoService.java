package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.ImmagineProdotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Repositories.ImmagineProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ImmagineProdottoService {

    @Autowired
    private ImmagineProdottoRepository immagineProdottoRepository;

    public void eliminaImmagine(UUID immagineId, Utente utente) {
        // 1. Trovo l'immagine nel database tramite il suo ID
        ImmagineProdotto immagine = immagineProdottoRepository.findById(immagineId)
                .orElseThrow(() -> new NotFoundException("Immagine con ID " + immagineId + " non trovata."));

        // 2. CONTROLLO DI SICUREZZA FONDAMENTALE:
        // Verifico che l'utente che sta chiedendo di cancellare l'immagine
        // sia effettivamente il venditore del prodotto a cui l'immagine è associata.
        if (!immagine.getProdotto().getVenditore().getId().equals(utente.getId())) {
            throw new BadRequestException("Non hai i permessi per eliminare l'immagine di un prodotto che non ti appartiene.");
        }

        // 3. Se il controllo di sicurezza passa, elimino l'immagine.
        immagineProdottoRepository.delete(immagine);
    }
}