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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RecensioneService {

    @Autowired
    private RecensioneRepository recensioneRepository;
    @Autowired
    private OrdineRepository ordineRepository;
    @Autowired
    private UtenteService utenteService; // Iniettato per trovare l'utente recensito

    // --- METODO DI CREAZIONE (POST) ---
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
        if (ordine.getStatoOrdine() != StatoOrdine.COMPLETATO) {
            throw new BadRequestException("Puoi recensire un ordine solo dopo che è stato segnato come 'COMPLETATO'.");
        }

        // 4. Controllo che non esista già una recensione per questo ordine (dal compratore)
        if (recensioneRepository.existsByOrdineId(ordine.getId())) {
            throw new BadRequestException("Hai già lasciato una recensione per questo ordine.");
        }

        // 5. Se tutti i controlli passano, creo la nuova recensione
        Recensione nuovaRecensione = new Recensione();
        nuovaRecensione.setValutazione(body.valutazione());
        nuovaRecensione.setCommento(body.commento());
        nuovaRecensione.setOrdine(ordine);
        nuovaRecensione.setRecensore(recensore);

        // Il recensito è il venditore dell'ordine
        // Nota: Questo funziona perché abbiamo aggiunto Utente venditore all'entità Ordine.
        Utente recensito = ordine.getVenditore();
        nuovaRecensione.setRecensito(recensito);

        return recensioneRepository.save(nuovaRecensione);
    }

    // --- METODO DI LETTURA (GET per Pagina Profilo) ---
    public Page<Recensione> findRecensioniRicevute(UUID recensitoId, Pageable pageable) {
        // 1. Troviamo l'utente da recensire (lancia NotFoundException se non esiste)
        Utente utenteRecensito = utenteService.findById(recensitoId);

        // 2. Cerchiamo le recensioni che l'utente ha ricevuto
        return recensioneRepository.findByRecensito(utenteRecensito, pageable);
    }

    // --- METODO DI CALCOLO RATING MEDIO ---
    public Double calcolaRatingMedio(UUID utenteId) {
        Utente utente = utenteService.findById(utenteId);

        // 1. Chiama il Repository per calcolare la media SQL
        Double media = recensioneRepository.calcolaMediaRating(utente);

        // 2. 🛑 CORREZIONE APPLICATA: Se AVG() in SQL non trova righe, restituisce NULL.
        // Lo convertiamo in 0.0 per evitare errori nel frontend.
        return media != null ? media : 0.0;
    }

    // --- METODO DI CONTEGGIO RECENSIONI ---
    public int contaRecensioni(UUID utenteId) {
        Utente utente = utenteService.findById(utenteId);
        return recensioneRepository.countByRecensito(utente);
    }
}