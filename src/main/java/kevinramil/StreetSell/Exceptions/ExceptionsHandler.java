package kevinramil.StreetSell.Exceptions;

import kevinramil.StreetSell.Payloads.ErrorDTO;
import kevinramil.StreetSell.Payloads.ErrorValidationDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

// Questa classe "intercetta" tutte le eccezioni lanciate nell'applicazione
@RestControllerAdvice
public class ExceptionsHandler {

    // Questo metodo gestisce tutte le eccezioni di tipo BadRequestException
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorDTO> handleBadRequest(BadRequestException ex) {
        // Creo un ErrorDTO con il messaggio dell'eccezione
        ErrorDTO errorPayload = new ErrorDTO(ex.getMessage(), LocalDateTime.now());
        // E lo invio come risposta con lo stato 400 BAD REQUEST
        return new ResponseEntity<>(errorPayload, HttpStatus.BAD_REQUEST);
    }

    // Questo metodo gestisce tutte le eccezioni di tipo UnauthorizedException
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorDTO> handleUnauthorized(UnauthorizedException ex) {
        ErrorDTO errorPayload = new ErrorDTO(ex.getMessage(), LocalDateTime.now());
        // Invio la risposta con lo stato 401 UNAUTHORIZED
        return new ResponseEntity<>(errorPayload, HttpStatus.UNAUTHORIZED);
    }

    // Questo metodo gestisce tutte le eccezioni di tipo NotFoundException
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorDTO> handleNotFound(NotFoundException ex) {
        ErrorDTO errorPayload = new ErrorDTO(ex.getMessage(), LocalDateTime.now());
        // Invio la risposta con lo stato 404 NOT FOUND
        return new ResponseEntity<>(errorPayload, HttpStatus.NOT_FOUND);
    }

    // Questo metodo gestisce le eccezioni di validazione
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorValidationDTO> handleValidation(ValidationException ex) {
        List<String> errors = ex.getErrorsList();
        ErrorValidationDTO errorsPayload = new ErrorValidationDTO(
                "Errore di validazione nel payload",
                LocalDateTime.now(),
                errors
        );
        return new ResponseEntity<>(errorsPayload, HttpStatus.BAD_REQUEST);
    }

    // Un gestore "catch-all" per tutte le altre eccezioni non gestite esplicitamente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDTO> handleGenericException(Exception ex) {
        // Logghiamo l'errore per il debug interno
        ex.printStackTrace();
        ErrorDTO errorPayload = new ErrorDTO("Errore generico del server, risolveremo al più presto!", LocalDateTime.now());
        // Invio la risposta con lo stato 500 INTERNAL SERVER ERROR
        return new ResponseEntity<>(errorPayload, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
