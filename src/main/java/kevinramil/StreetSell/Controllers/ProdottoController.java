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
import kevinramil.StreetSell.Services.UtenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private UtenteService utenteService; // 🛑 AGGIUNGI IL SERVICE UTENTE

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    // Endpoint per creare un nuovo prodotto
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public Prodotto creaProdotto(@RequestPart("prodotto") String prodottoDtoString,
                                 @RequestPart(value = "immagini", required = false) MultipartFile[] immagini,
                                 @AuthenticationPrincipal Utente currentUser) {

        // Protezione iniziale, anche se il filtro JWT dovrebbe gestire questo
        if (currentUser == null) {
            throw new UnauthorizedException("Autenticazione richiesta.");
        }

        ProdottoDTO prodottoDTO;
        try {
            prodottoDTO = objectMapper.readValue(prodottoDtoString, ProdottoDTO.class);
        } catch (Exception e) {
            throw new ValidationException(Collections.singletonList("Dati prodotto non validi (JSON malformato): " + e.getMessage()));
        }

        Set<ConstraintViolation<ProdottoDTO>> violations = validator.validate(prodottoDTO);
        if (!violations.isEmpty()) {
            throw new ValidationException(
                    violations.stream()
                            .map(err -> err.getMessage())
                            .collect(Collectors.toList())
            );
        }

        // 🛑 L'utente è già completo qui se usi @AuthenticationPrincipal, ma per sicurezza...
        Utente venditoreCompleto = utenteService.findById(currentUser.getId());

        return prodottoService.creaProdotto(prodottoDTO, venditoreCompleto, immagini);
    }

    // Endpoint per ottenere la lista di tutti i prodotti disponibili
    @GetMapping("")
    public Page<Prodotto> getAllProdottiDisponibili(@RequestParam(defaultValue = "10") int size,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
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
        // Sicurezza: Usiamo l'ID del current user per l'autorizzazione
        if (currentUser == null) {
            throw new UnauthorizedException("Autenticazione richiesta.");
        }

        return prodottoService.updateProdotto(prodottoId, prodottoDTO, currentUser);
    }

    @DeleteMapping("/{prodottoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiviaProdotto(@PathVariable UUID prodottoId,
                                 @AuthenticationPrincipal Utente currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Autenticazione richiesta.");
        }
        prodottoService.archiviaProdotto(prodottoId, currentUser);
    }

    // 🛑 ENDPOINT PRODOTTI DEL VENDITORE (FIX NPE)
    @GetMapping("/me")
    public Page<Prodotto> getMyProdotti(@AuthenticationPrincipal Utente currentUser,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy) {

        // 1. PREVENZIONE 401
        if (currentUser == null) {
            throw new UnauthorizedException("Devi effettuare il login per vedere i tuoi prodotti.");
        }

        // 2. 🛑 FIX NPE: Ricarica l'utente completo dal DB
        // Questo risolve i problemi di Lazy Loading e Utente incompleto
        Utente venditoreCompleto = utenteService.findById(currentUser.getId());

        // Log di verifica (ora sicuri)
        System.out.println("Utente Corrente ID: " + venditoreCompleto.getId());
        System.out.println("Utente Corrente Username: " + venditoreCompleto.getUsername());

        // 3. Esegui la query
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());

        return prodottoService.findProdottiByVenditore(venditoreCompleto, pageable);
    }

}