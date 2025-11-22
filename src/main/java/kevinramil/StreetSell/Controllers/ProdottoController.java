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
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/prodotti")
public class ProdottoController {

    @Autowired
    private ProdottoService prodottoService;

    @Autowired
    private UtenteService utenteService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    // --- CREAZIONE (POST) ---
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Prodotto creaProdotto(@RequestPart("prodotto") String prodottoDtoString,
                                 @RequestPart(value = "immagini", required = false) MultipartFile[] immagini,
                                 @AuthenticationPrincipal Utente currentUser) {

        if (currentUser == null) throw new UnauthorizedException("Autenticazione richiesta.");

        // 1. Parsing del JSON
        ProdottoDTO prodottoDTO = parseAndValidate(prodottoDtoString);

        // 2. Ricarica Utente Completo
        Utente venditoreCompleto = utenteService.findById(currentUser.getId());

        return prodottoService.creaProdotto(prodottoDTO, venditoreCompleto, immagini);
    }

    // --- LISTA (GET) ---
    @GetMapping("")
    public List<Prodotto> getAllProdottiDisponibili() {
        return prodottoService.findAll();
    }

    // --- DETTAGLIO (GET) ---
    @GetMapping("/{prodottoId}")
    public Prodotto getSingoloProdotto(@PathVariable UUID prodottoId) {
        return prodottoService.findById(prodottoId);
    }

    // --- MODIFICA (PUT) ---
    // 🛑 FIX: Ora accetta Multipart per le immagini e ricarica l'utente
    @PutMapping(value = "/{prodottoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Prodotto updateProdotto(@PathVariable UUID prodottoId,
                                   @RequestPart("prodotto") String prodottoDtoString,
                                   @RequestPart(value = "immagini", required = false) MultipartFile[] nuoveImmagini,
                                   @AuthenticationPrincipal Utente currentUser) {

        if (currentUser == null) throw new UnauthorizedException("Autenticazione richiesta.");

        ProdottoDTO prodottoDTO = parseAndValidate(prodottoDtoString);

        // 🛑 FIX: Ricarica Utente Completo
        Utente utenteCompleto = utenteService.findById(currentUser.getId());

        // Nota: Assicurati che il tuo ProdottoService.updateProdotto accetti 'nuoveImmagini'
        return prodottoService.updateProdotto(prodottoId, prodottoDTO, utenteCompleto, nuoveImmagini);
    }

    // --- ELIMINA PRODOTTO (ARCHIVIAZIONE) ---
    @DeleteMapping("/{prodottoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiviaProdotto(@PathVariable UUID prodottoId,
                                 @AuthenticationPrincipal Utente currentUser) {
        if (currentUser == null) throw new UnauthorizedException("Autenticazione richiesta.");

        // 🛑 FIX 500: Ricarica Utente Completo PRIMA di chiamare il service
        Utente utenteCompleto = utenteService.findById(currentUser.getId());

        prodottoService.archiviaProdotto(prodottoId, utenteCompleto);
    }

    // --- ELIMINA SINGOLA IMMAGINE ---
    @DeleteMapping("/{prodottoId}/immagini/{immagineId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminaImmagine(@PathVariable UUID prodottoId,
                                @PathVariable UUID immagineId,
                                @AuthenticationPrincipal Utente currentUser) {

        if (currentUser == null) throw new UnauthorizedException("Autenticazione richiesta.");

        // 🛑 FIX 500: Ricarica Utente Completo
        Utente utenteCompleto = utenteService.findById(currentUser.getId());

        prodottoService.removeImmagine(prodottoId, immagineId, utenteCompleto);
    }

    // --- I MIEI PRODOTTI (GET) ---
    @GetMapping("/me")
    public Page<Prodotto> getMyProdotti(@AuthenticationPrincipal Utente currentUser,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy) {

        if (currentUser == null) throw new UnauthorizedException("Devi effettuare il login.");

        // 🛑 Ricarica Utente Completo
        Utente venditoreCompleto = utenteService.findById(currentUser.getId());

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return prodottoService.findProdottiByVenditore(venditoreCompleto, pageable);
    }

    // --- METODO HELPER PRIVATO ---
    private ProdottoDTO parseAndValidate(String json) {
        ProdottoDTO dto;
        try {
            dto = objectMapper.readValue(json, ProdottoDTO.class);
        } catch (Exception e) {
            throw new ValidationException(Collections.singletonList("Dati prodotto non validi (JSON malformato): " + e.getMessage()));
        }

        Set<ConstraintViolation<ProdottoDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            throw new ValidationException(
                    violations.stream()
                            .map(ConstraintViolation::getMessage)
                            .collect(Collectors.toList())
            );
        }
        return dto;
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public Page<Prodotto> getAllProdottiAdmin(@RequestParam(defaultValue = "10") int size,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "createdAt") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return prodottoService.findTuttiIProdotti(pageable); // <-- ASSICURATI CHE QUESTA CHIAMATA ESISTA NEL TUO SERVICE
    }

    @PatchMapping("/{prodottoId}/suspend")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Prodotto sospendiProdottoAdmin(@PathVariable UUID prodottoId) {
        // Non è necessario passare currentUser se la logica di controllo è stata spostata nell'endpoint
        return prodottoService.sospendiProdottoAdmin(prodottoId);
    }
}