package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.ImmagineProdotto;
import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoProdotto;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.ProdottoDTO;
import kevinramil.StreetSell.Repositories.ProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProdottoService {

    @Autowired
    private ProdottoRepository prodottoRepository;

    // Il venditore verrà passato dal Controller, dopo averlo recuperato
    // in modo sicuro dal contesto di autenticazione
    public Prodotto creaProdotto(ProdottoDTO prodottoDTO, Utente venditore, MultipartFile[] immagini) {

        Prodotto nuovoProdotto = new Prodotto();
        nuovoProdotto.setTitolo(prodottoDTO.titolo());
        nuovoProdotto.setDescrizione(prodottoDTO.descrizione());
        nuovoProdotto.setPrezzo(prodottoDTO.prezzo());
        nuovoProdotto.setCategoria(prodottoDTO.categoria());
        nuovoProdotto.setCondizione(prodottoDTO.condizione());
        nuovoProdotto.setStatoProdotto(StatoProdotto.DISPONIBILE);

        nuovoProdotto.setVenditore(venditore);

        List<ImmagineProdotto> listaImmagini = new ArrayList<>();
        if (immagini != null && immagini.length > 0) {
            for (MultipartFile file : immagini) {
                try {
                    // Salva il file su disco: cartella "uploads"
                    String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
                    Path uploadDir = Paths.get("uploads");
                    Files.createDirectories(uploadDir); // Crea la cartella se non c'è
                    Path filePath = uploadDir.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);

                    ImmagineProdotto img = new ImmagineProdotto();
                    img.setUrl("/uploads/" + fileName); // Salva path relativo per il recupero dall'app
                    img.setProdotto(nuovoProdotto);
                    listaImmagini.add(img);
                } catch (Exception e) {
                    // puoi decidere se fare fallback, lanciare errore, etc.
                    throw new RuntimeException("Errore nel salvataggio immagine: " + e.getMessage());
                }
            }
        }

        nuovoProdotto.setImmagini(listaImmagini);

        // Salva tutto!
        return prodottoRepository.save(nuovoProdotto);
    }

    // Metodo per trovare tutti i prodotti disponibilil con paginazione
    public Page<Prodotto> findProdottiDisponibili(Pageable pageable) {
        return prodottoRepository.findByStatoProdotto(StatoProdotto.DISPONIBILE, pageable);
    }

    // Metodo per cercare il prodotto dal suo ID
    public Prodotto findById(UUID id) {
        Prodotto prodotto = prodottoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Prodotto con ID " + id + " non trovato"));

        if (prodotto.getStatoProdotto() == StatoProdotto.ARCHIVIATO) {
            throw new NotFoundException("Prodotto con ID " + id + " non trovato oppure non è disponibile");
        }

        return prodotto;
    }

    // Metodo per aggiornare un prodotto
    @Transactional
    public Prodotto updateProdotto(UUID prodottoId, ProdottoDTO body, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId); // Trova il prodotto

        // CONTROLLO DI SICUREZZA: l'utente loggato è il venditore del prodotto?
        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per modificare un prodotto che non ti appartiene.");
        }

        // Aggiorna i campi del prodotto con i nuovi dati
        prodotto.setTitolo(body.titolo());
        prodotto.setDescrizione(body.descrizione());
        prodotto.setPrezzo(body.prezzo());
        prodotto.setCategoria(body.categoria());

        return prodottoRepository.save(prodotto);
    }

    // Metodo per archiviare (soft delete) un prodotto
    @Transactional
    public void archiviaProdotto(UUID prodottoId, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId);

        // CONTROLLO DI SICUREZZA: l'utente loggato è il venditore del prodotto?
        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per eliminare un prodotto che non ti appartiene.");
        }

        // Imposta lo stato su ARCHIVIATO invece di cancellare
        prodotto.setStatoProdotto(StatoProdotto.ARCHIVIATO);
        prodottoRepository.save(prodotto);
    }
}