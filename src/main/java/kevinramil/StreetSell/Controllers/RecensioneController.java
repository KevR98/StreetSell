package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Recensione;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.ValidationException;
import kevinramil.StreetSell.Payloads.RecensioneDTO;
import kevinramil.StreetSell.Services.RecensioneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/recensioni")
public class RecensioneController {

    @Autowired
    private RecensioneService recensioneService;

    // Endpoint per creare una nuova recensione
    // Sarà accessibile solo a utenti autenticati (grazie a SecurityConfig)
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public Recensione creaRecensione(
            @RequestBody @Validated RecensioneDTO body,
            BindingResult validation,
            @AuthenticationPrincipal Utente currentUser) { // Otteniamo l'utente loggato in modo sicuro

        if (validation.hasErrors()) {
            throw new ValidationException(
                    validation.getAllErrors().stream()
                            .map(err -> err.getDefaultMessage())
                            .collect(Collectors.toList())
            );
        }

        // Passiamo al service il DTO e l'utente che sta effettuando la richiesta (il recensore)
        return recensioneService.creaRecensione(body, currentUser);
    }
}