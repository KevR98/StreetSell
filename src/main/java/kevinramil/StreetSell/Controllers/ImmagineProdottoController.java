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

    @DeleteMapping("/{immagineId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminaImmagine(@PathVariable UUID immagineId,
                                @AuthenticationPrincipal Utente currentUser) {

        immagineProdottoService.eliminaImmagine(immagineId, currentUser);
    }
}