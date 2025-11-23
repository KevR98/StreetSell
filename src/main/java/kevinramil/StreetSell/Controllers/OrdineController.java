package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Ordine;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.ValidationException;
import kevinramil.StreetSell.Payloads.OrdineDTO;
import kevinramil.StreetSell.Services.OrdineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ordini")
public class OrdineController {

    @Autowired
    private OrdineService ordineService;

    // Endpoint per creare un nuovo ordine
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public Ordine creaOrdine(@RequestBody @Validated OrdineDTO body,
                             BindingResult validation,
                             @AuthenticationPrincipal Utente currentUser) { // Otteniamo il compratore in modo sicuro
        if (validation.hasErrors()) {
            throw new ValidationException(
                    validation.getAllErrors().stream()
                            .map(err -> err.getDefaultMessage())
                            .collect(Collectors.toList())
            );
        }
        // Passiamo al service i dati dell'ordine e il compratore
        return ordineService.creaOrdine(body, currentUser);
    }

    @GetMapping("/notifiche/in-spedizione")
    public Map<String, Long> getCountOrdiniInSpedizione(@AuthenticationPrincipal Utente currentUser) {

        long count = ordineService.contaOrdiniInAttesaDiSpedizione(currentUser);

        // Restituisce un oggetto JSON semplice: {"count": 3}
        return Map.of("count", count);
    }

    @GetMapping("/venditore")
    public List<Ordine> getOrdiniVenditore(@AuthenticationPrincipal Utente currentUser) {
        // Questo endpoint recupera solo gli ordini nello stato CONFERMATO (in attesa di spedizione)
        return ordineService.findOrdiniByVenditore(currentUser);
    }
}