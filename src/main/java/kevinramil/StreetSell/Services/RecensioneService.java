package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Ordine;
import kevinramil.StreetSell.Entities.Recensione;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoOrdine;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.RecensioneDTO;
import kevinramil.StreetSell.Repositories.OrdineRepository;
import kevinramil.StreetSell.Repositories.RecensioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecensioneService {

    @Autowired
    private RecensioneRepository recensioneRepository;
    @Autowired
    private OrdineRepository ordineRepository;
    // Non ci serve UtenteRepository qui perché l'utente ci viene passato già "trovato"

    @Transactional
    public Recensione creaRecensione(RecensioneDTO body, Utente recensore) {
        // 1. Trovo l'ordine che si vuole recensire
        Ordine ordine = ordineRepository.findById(body.ordineId())
                .orElseThrow(() -> new NotFoundException("Ordine con ID " + body.ordineId() + " non trovato."));

        // 2. Controllo che l'utente che sta recensendo sia il compratore di quell'ordine
        if (!ordine.getCompratore().getId().equals(recensore.getId())) {
            throw new BadRequestException("Non puoi recensire un ordine che non hai effettuato tu.");
        }

        // 3. Controllo che l'ordine sia stato completato
        // Usiamo l'enum StatoOrdine.COMPLETATO che hai definito. Ottimo!
        if (ordine.getStatoOrdine() != StatoOrdine.COMPLETATO) {
            throw new BadRequestException("Puoi recensire un ordine solo dopo che è stato segnato come 'COMPLETATO'.");
        }

        // 4. Controllo che non esista già una recensione per questo ordine
        if (recensioneRepository.existsByOrdineId(ordine.getId())) {
            throw new BadRequestException("Hai già lasciato una recensione per questo ordine.");
        }

        // 5. Se tutti i controlli passano, creo la nuova recensione
        Recensione nuovaRecensione = new Recensione();
        nuovaRecensione.setValutazione(body.valutazione());
        nuovaRecensione.setCommento(body.commento());
        nuovaRecensione.setOrdine(ordine);
        nuovaRecensione.setRecensore(recensore); // L'utente loggato

        // Il recensito è il venditore del prodotto in quell'ordine
        Utente recensito = ordine.getProdotto().getVenditore();
        nuovaRecensione.setRecensito(recensito);

        // La data di creazione è gestita automaticamente dalla tua entità con @PrePersist

        return recensioneRepository.save(nuovaRecensione);
    }

    // Potremmo aggiungere altri metodi qui in futuro (es. findRecensioniByUtente)
}