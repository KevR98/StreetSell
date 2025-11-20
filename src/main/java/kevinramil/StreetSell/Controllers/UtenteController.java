package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Recensione;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Services.RecensioneService;
import kevinramil.StreetSell.Services.UtenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/utenti")
public class UtenteController {

    @Autowired
    private UtenteService utenteService;

    // 🛑 AGGIUNTA
    @Autowired
    private RecensioneService recensioneService;

    // ---- ENDPOINT PUBBLICI PER LA PAGINA PROFILO ----

    // GET /utenti/{id} -> Ritorna un singolo utente (Ora PUBBLICO per visualizzare il profilo)
    @GetMapping("/{utenteId}")
    // 🛑 MODIFICA: Rimosso PreAuthorize per rendere il profilo visibile a tutti
    public Utente getUtenteById(@PathVariable UUID utenteId) {
        return utenteService.findById(utenteId);
    }

    // 🛑 AGGIUNTA: Endpoint per ottenere il rating medio e il conteggio
    // GET /utenti/{utenteId}/rating
    @GetMapping("/{utenteId}/rating")
    public ResponseEntity<Map<String, Object>> getRatingMedio(@PathVariable UUID utenteId) {
        Double media = recensioneService.calcolaRatingMedio(utenteId);
        int count = recensioneService.contaRecensioni(utenteId);

        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", media);
        response.put("reviewCount", count);

        return ResponseEntity.ok(response);
    }

    // 🛑 AGGIUNTA: Endpoint per ottenere la lista di recensioni paginata per la pagina profilo
    // GET /utenti/{utenteId}/recensioni?page=0&size=5
    @GetMapping("/{utenteId}/recensioni")
    public Page<Recensione> getRecensioniUtente(
            @PathVariable UUID utenteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dataCreazione").descending());
        return recensioneService.findRecensioniRicevute(utenteId, pageable);
    }


    // ---- ENDPOINT PER UTENTE LOGGATO ----

    // GET /utenti/me -> Ritorna i dettagli del proprio profilo
    @GetMapping("/me")
    public Utente getMioProfilo(@AuthenticationPrincipal Utente currentUser) {
        return currentUser;
    }

    // DELETE /utenti/me -> L'utente disattiva il proprio account
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disattivaMioProfilo(@AuthenticationPrincipal Utente currentUser) {
        utenteService.disattivaMioAccount(currentUser);
    }


    // ---- ENDPOINT PER ADMIN ----

    // 🛑 MODIFICA: Spostato su /all per evitare conflitti con la rotta /utenteId
    // GET /utenti/all -> Ritorna la lista di tutti gli utenti
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Utente> getAllUtenti() {
        return utenteService.findAll();
    }

    // DELETE /utenti/{id} -> Disattiva l'account di un utente
    @DeleteMapping("/{utenteId}/admin-disattiva") // Ho reso il path più specifico per l'admin
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void disattivaUtenteAdmin(@PathVariable UUID utenteId) {
        utenteService.disattivaUtente(utenteId);
    }
}