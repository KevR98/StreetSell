package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Services.ImmagineProdottoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/immagini-prodotto")
public class ImmagineProdottoController {

    @Autowired
    private ImmagineProdottoService immagineProdottoService;

    // Definiamo un endpoint DELETE che accetta l'ID dell'immagine da cancellare
    // Esempio di chiamata API: DELETE http://tuo-dominio/immagini-prodotto/123e4567-e89b-12d3-a456-426614174000
    @DeleteMapping("/{immagineId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Risposta 204 No Content (standard per delete OK)
    public void eliminaImmagine(@PathVariable UUID immagineId,
                                @AuthenticationPrincipal Utente currentUser) { // Prendiamo l'utente loggato in modo sicuro

        immagineProdottoService.eliminaImmagine(immagineId, currentUser);
    }
}