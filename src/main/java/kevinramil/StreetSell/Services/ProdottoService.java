package kevinramil.StreetSell.Services;

// 1. IMPORT NECESSARI PER CLOUDINARY

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import kevinramil.StreetSell.Entities.ImmagineProdotto;
import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoProdotto;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.ProdottoDTO;
import kevinramil.StreetSell.Repositories.ImmagineProdottoRepository;
import kevinramil.StreetSell.Repositories.ProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProdottoService {

    @Autowired
    private ProdottoRepository prodottoRepository;

    // 2. INIETTIAMO IL SERVIZIO CLOUDINARY (dal CloudinaryConfig.java)
    @Autowired
    private ImmagineProdottoRepository immagineRepository;

    @Autowired
    private Cloudinary cloudinary;

    // CREATE
    public Prodotto creaProdotto(ProdottoDTO prodottoDTO, Utente venditore, MultipartFile[] immagini) {
        Prodotto nuovoProdotto = new Prodotto();
        nuovoProdotto.setTitolo(prodottoDTO.titolo());
        nuovoProdotto.setDescrizione(prodottoDTO.descrizione());
        nuovoProdotto.setPrezzo(prodottoDTO.prezzo());
        nuovoProdotto.setCategoria(prodottoDTO.categoria());
        nuovoProdotto.setCondizione(prodottoDTO.condizione());
        nuovoProdotto.setStatoProdotto(StatoProdotto.DISPONIBILE);
        nuovoProdotto.setVenditore(venditore);

        List<ImmagineProdotto> listaImmagini = uploadImmagini(immagini, nuovoProdotto);
        nuovoProdotto.setImmagini(listaImmagini);

        return prodottoRepository.save(nuovoProdotto);
    }

    // UPDATE (Modificato per gestire immagini)
    @Transactional
    public Prodotto updateProdotto(UUID prodottoId, ProdottoDTO body, Utente currentUser, MultipartFile[] nuoveImmagini) {
        Prodotto prodotto = this.findById(prodottoId);

        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per modificare questo prodotto.");
        }

        // Aggiorna i campi di testo
        prodotto.setTitolo(body.titolo());
        prodotto.setDescrizione(body.descrizione());
        prodotto.setPrezzo(body.prezzo());
        prodotto.setCategoria(body.categoria());
        prodotto.setCondizione(body.condizione()); // Aggiorna anche la condizione se serve

        // Se ci sono nuove immagini, caricale e aggiungile alla lista esistente
        if (nuoveImmagini != null && nuoveImmagini.length > 0) {
            List<ImmagineProdotto> nuove = uploadImmagini(nuoveImmagini, prodotto);
            prodotto.getImmagini().addAll(nuove);
        }

        return prodottoRepository.save(prodotto);
    }

    // DELETE IMMAGINE
    @Transactional
    public void removeImmagine(UUID prodottoId, UUID immagineId, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId);

        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per modificare questo prodotto.");
        }

        // Cerca l'immagine nella lista del prodotto
        ImmagineProdotto imgToRemove = prodotto.getImmagini().stream()
                .filter(img -> img.getId().equals(immagineId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Immagine non trovata"));

        // Rimuovi dalla lista (Hibernate gestirà l'eliminazione grazie a orphanRemoval=true in Prodotto)
        prodotto.getImmagini().remove(imgToRemove);

        // Opzionale: Elimina anche da Cloudinary se hai salvato il public_id
        prodottoRepository.save(prodotto);
    }

    // Helper per upload su Cloudinary
    private List<ImmagineProdotto> uploadImmagini(MultipartFile[] files, Prodotto prodotto) {
        List<ImmagineProdotto> lista = new ArrayList<>();
        if (files == null || files.length == 0) return lista;

        for (MultipartFile file : files) {
            try {
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                String url = (String) uploadResult.get("url");

                ImmagineProdotto img = new ImmagineProdotto();
                img.setUrl(url);
                img.setProdotto(prodotto);
                lista.add(img);
            } catch (IOException e) {
                throw new RuntimeException("Errore upload Cloudinary: " + e.getMessage());
            }
        }
        return lista;
    }

    // ALTRI METODI (findById, archiviaProdotto, etc) rimangono uguali...
    @Transactional
    public Page<Prodotto> findProdottiDisponibili(Pageable pageable) {
        return prodottoRepository.findByStatoProdotto(StatoProdotto.DISPONIBILE, pageable);
    }

    public Prodotto findById(UUID id) {
        return prodottoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Prodotto non trovato"));
    }

    @Transactional
    public void archiviaProdotto(UUID prodottoId, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId);
        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi.");
        }
        prodotto.setStatoProdotto(StatoProdotto.ARCHIVIATO);
        prodottoRepository.save(prodotto);
    }

    @Transactional
    public Page<Prodotto> findProdottiByVenditore(Utente venditore, Pageable pageable) {
        return prodottoRepository.findByVenditore(venditore, pageable);
    }

    public Page<Prodotto> findTuttiIProdotti(Pageable pageable) {
        // Chiama il metodo findAll() paginato nel Repository.
        return prodottoRepository.findAll(pageable);
    }

    @Transactional
    public Prodotto sospendiProdottoAdmin(UUID prodottoId) {
        Prodotto prodotto = this.findById(prodottoId);

        // Non è necessario verificare l'ownership qui, poiché l'endpoint è protetto da @PreAuthorize('ADMIN')

        prodotto.setStatoProdotto(StatoProdotto.ARCHIVIATO); // Imposta lo stato su Archiviato/Sospeso
        return prodottoRepository.save(prodotto);
    }

    public List<Prodotto> findAll() {
        return prodottoRepository.findByStatoProdotto(
                StatoProdotto.DISPONIBILE,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }
}