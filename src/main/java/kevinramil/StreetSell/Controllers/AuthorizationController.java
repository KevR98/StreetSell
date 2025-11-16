package kevinramil.StreetSell.Controllers;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.ValidationException;
import kevinramil.StreetSell.Payloads.LoginDTO;
import kevinramil.StreetSell.Payloads.LoginResponseDTO;
import kevinramil.StreetSell.Payloads.UtenteDTO;
import kevinramil.StreetSell.Services.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth") // Tutti gli endpoint in questa classe inizieranno con /auth
public class AuthorizationController {

    @Autowired
    private AuthorizationService authService;

    // Endpoint per il LOGIN -> POST /auth/login
    @PostMapping("/login")
    // 🛑 MODIFICA QUI: Il tipo di ritorno è ora LoginResponseDTO
    public LoginResponseDTO login(@RequestBody @Validated LoginDTO body, BindingResult validation) {
        if (validation.hasErrors()) {
            throw new ValidationException(
                    validation.getAllErrors().stream()
                            .map(err -> err.getDefaultMessage())
                            .collect(Collectors.toList())
            );
        }

        // Chiama il service che ora restituisce LoginResponseDTO
        return authService.authenticateAndGenerateToken(body);
    }

    // Endpoint per la REGISTRAZIONE -> POST /auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Utente register(@RequestBody @Validated UtenteDTO body, BindingResult validation) {
        if (validation.hasErrors()) {
            throw new ValidationException(
                    validation.getAllErrors().stream()
                            .map(err -> err.getDefaultMessage())
                            .collect(Collectors.toList())
            );
        }
        return authService.registraUtente(body);
    }
}