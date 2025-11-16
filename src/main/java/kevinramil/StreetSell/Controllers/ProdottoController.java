package kevinramil.StreetSell.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.UnauthorizedException;
import kevinramil.StreetSell.Exceptions.ValidationException;
import kevinramil.StreetSell.Payloads.ProdottoDTO;
import kevinramil.StreetSell.Services.ProdottoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/prodotti")
public class ProdottoController {

    @Autowired
    private ProdottoService prodottoService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    // Endpoint per creare un nuovo prodotto
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public Prodotto creaProdotto(@RequestPart("prodotto") String prodottoDtoString,
                                 @RequestPart(value = "immagini", required = false) MultipartFile[] immagini,
                                 @AuthenticationPrincipal Utente currentUser) { // Otteniamo il venditore in modo sicuro
        ProdottoDTO prodottoDTO;
        try {
            // --- 2. CONVERTI MANUALMENTE LA STRINGA IN DTO ---
            prodottoDTO = objectMapper.readValue(prodottoDtoString, ProdottoDTO.class);
        } catch (Exception e) {
            // Se il JSON non è valido, lancia un'eccezione
            throw new ValidationException(Collections.singletonList("Dati prodotto non validi (JSON malformato): " + e.getMessage()));
        }

        Set<ConstraintViolation<ProdottoDTO>> violations = validator.validate(prodottoDTO);
        if (!violations.isEmpty()) {
            // Se ci sono errori, crea una LISTA di messaggi
            throw new ValidationException(
                    violations.stream()
                            .map(err -> err.getMessage())
                            .collect(Collectors.toList())
            );
        }


        // Passiamo al service sia i dati del prodotto (body) sia il venditore (currentUser)
        return prodottoService.creaProdotto(prodottoDTO, currentUser, immagini);
    }

    // Endpoint per ottenere la lista di tutti i prodotti disponibili
    @GetMapping("")
    public Page<Prodotto> getAllProdottiDisponibili(@PageableDefault(size = 10, sort = "titolo")
                                                    Pageable pageable) {
        return prodottoService.findProdottiDisponibili(pageable);
    }

    @GetMapping("/{prodottoId}")
    public Prodotto getSingoloProdotto(@PathVariable UUID prodottoId) {
        return prodottoService.findById(prodottoId);
    }

    @PutMapping("/{prodottoId}")
    public Prodotto updateProdotto(@PathVariable UUID prodottoId,
                                   @RequestBody @Validated ProdottoDTO prodottoDTO,
                                   BindingResult validation,
                                   @AuthenticationPrincipal Utente currentUser) {
        if (validation.hasErrors()) {
            throw new ValidationException(validation.getAllErrors().stream().map(e -> e.getDefaultMessage()).collect(Collectors.toList()));
        }
        return prodottoService.updateProdotto(prodottoId, prodottoDTO, currentUser);
    }

    /**
     * Endpoint per "archiviare" (soft delete) un prodotto.
     * Solo il venditore originale può rimuovere il suo prodotto.
     */
    @DeleteMapping("/{prodottoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Risposta 204 No Content, standard per DELETE ok
    public void archiviaProdotto(@PathVariable UUID prodottoId,
                                 @AuthenticationPrincipal Utente currentUser) {
        prodottoService.archiviaProdotto(prodottoId, currentUser);
    }

    @GetMapping("/me") // Rotta per i prodotti del venditore loggato
    public Page<Prodotto> getMyProdotti(@AuthenticationPrincipal Utente currentUser,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        // 🛑 CORREGGI QUI: Ordina per il campo corretto (es. 'createdAt')
                                        @RequestParam(defaultValue = "createdAt") String sortBy) {

        System.out.println("Utente Corrente ID: " + currentUser.getId());
        System.out.println("Utente Corrente Username: " + currentUser.getUsername());

        if (currentUser == null) {
            // Usa l'eccezione che hai già per le credenziali non valide
            throw new UnauthorizedException("Accesso negato. Token JWT mancante o non valido.");
        }

        // Assumendo che tu costruisca il Pageable con il sortBy
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());

        return prodottoService.findProdottiByVenditore(currentUser, pageable);
    }

}
