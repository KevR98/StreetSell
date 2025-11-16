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
import kevinramil.StreetSell.Repositories.ProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private Cloudinary cloudinary;

    // 3. METODO creaProdotto MODIFICATO
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

                    // A. Carica il file su Cloudinary
                    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

                    // B. Estrai l'URL pubblico restituito da Cloudinary
                    String urlCloudinary = (String) uploadResult.get("url");

                    // C. Salva l'URL di Cloudinary nel database
                    ImmagineProdotto img = new ImmagineProdotto();
                    img.setUrl(urlCloudinary); // <-- Ora salviamo l'URL di Cloudinary
                    img.setProdotto(nuovoProdotto);
                    listaImmagini.add(img);

                } catch (IOException e) { // Cambiato Exception in IOException
                    throw new RuntimeException("Errore durante l'upload dell'immagine su Cloudinary: " + e.getMessage());
                }
            }
        }

        nuovoProdotto.setImmagini(listaImmagini);

        // Salva il prodotto (con gli URL di Cloudinary)
        return prodottoRepository.save(nuovoProdotto);
    }

    // --- I SEGUENTI METODI RIMANGONO INVARIATI ---

    @Transactional
    public Page<Prodotto> findProdottiDisponibili(Pageable pageable) {
        return prodottoRepository.findByStatoProdotto(StatoProdotto.DISPONIBILE, pageable);
    }

    public Prodotto findById(UUID id) {
        Prodotto prodotto = prodottoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Prodotto con ID " + id + " non trovato"));

        if (prodotto.getStatoProdotto() == StatoProdotto.ARCHIVIATO) {
            throw new NotFoundException("Prodotto con ID " + id + " non trovato oppure non è disponibile");
        }

        return prodotto;
    }

    @Transactional
    public Prodotto updateProdotto(UUID prodottoId, ProdottoDTO body, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId);

        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per modificare un prodotto che non ti appartiene.");
        }

        prodotto.setTitolo(body.titolo());
        prodotto.setDescrizione(body.descrizione());
        prodotto.setPrezzo(body.prezzo());
        prodotto.setCategoria(body.categoria());

        return prodottoRepository.save(prodotto);
    }

    @Transactional
    public void archiviaProdotto(UUID prodottoId, Utente currentUser) {
        Prodotto prodotto = this.findById(prodottoId);

        if (!prodotto.getVenditore().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Non hai i permessi per eliminare un prodotto che non ti appartiene.");
        }

        prodotto.setStatoProdotto(StatoProdotto.ARCHIVIATO);
        prodottoRepository.save(prodotto);
    }
}