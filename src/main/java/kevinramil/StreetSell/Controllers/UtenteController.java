package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Services.UtenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/utenti")
public class UtenteController {

    @Autowired
    private UtenteService utenteService;

    // ---- ENDPOINT PER ADMIN ----
    // GET /utenti -> Ritorna la lista di tutti gli utenti (attivi)
    @GetMapping("")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Utente> getAllUtenti() {
        return utenteService.findAll();
    }

    // GET /utenti/{id} -> Ritorna un singolo utente (attivo)
    @GetMapping("/{utenteId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Utente getUtenteById(@PathVariable UUID utenteId) {
        return utenteService.findById(utenteId);
    }

    // DELETE /utenti/{id} -> Disattiva l'account di un utente
    @DeleteMapping("/{utenteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void disattivaUtente(@PathVariable UUID utenteId) {
        utenteService.disattivaUtente(utenteId);
    }

    // ---- ENDPOINT PER UTENTE LOGGATO ----
    // GET /utenti/me -> Ritorna i dettagli del proprio profilo
    @GetMapping("/me")
    public Utente getMioProfilo(@AuthenticationPrincipal Utente currentUser) {
        // L'oggetto Utente ci viene già fornito da Spring Security, non serve nemmeno chiamare il service!
        return currentUser;
    }

    // DELETE /utenti/me -> L'utente disattiva il proprio account
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disattivaMioProfilo(@AuthenticationPrincipal Utente currentUser) {
        utenteService.disattivaMioAccount(currentUser);
    }
}