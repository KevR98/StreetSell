package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Indirizzo;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.ValidationException;
import kevinramil.StreetSell.Payloads.IndirizzoDTO;
import kevinramil.StreetSell.Services.IndirizzoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/indirizzi")
public class IndirizzoController {

    @Autowired
    private IndirizzoService indirizzoService;

    // POST /indirizzi -> Aggiunge un nuovo indirizzo al profilo dell'utente loggato
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public Indirizzo aggiungiIndirizzo(@RequestBody @Validated IndirizzoDTO body,
                                       BindingResult validation,
                                       @AuthenticationPrincipal Utente currentUser) {
        if (validation.hasErrors()) {
            throw new ValidationException(validation.getAllErrors().stream().map(e -> e.getDefaultMessage()).collect(Collectors.toList()));
        }
        return indirizzoService.aggiungiIndirizzo(body, currentUser);
    }

    // GET /indirizzi -> Restituisce la lista degli indirizzi dell'utente loggato
    @GetMapping("")
    public List<Indirizzo> getMieiIndirizzi(@AuthenticationPrincipal Utente currentUser) {
        return indirizzoService.getIndirizziPerUtente(currentUser);
    }

    // DELETE /indirizzi/{id} -> Cancella un indirizzo specifico dell'utente loggato
    @DeleteMapping("/{indirizzoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204 No Content è la risposta standard per una delete andata a buon fine
    public void eliminaIndirizzo(@PathVariable UUID indirizzoId,
                                 @AuthenticationPrincipal Utente currentUser) {
        indirizzoService.eliminaIndirizzo(indirizzoId, currentUser);
    }
}