package kevinramil.StreetSell.Exceptions;

import lombok.Getter;

import java.util.List;

@Getter
public class ValidationException extends RuntimeException {
    private final List<String> errorsList;

    public ValidationException(List<String> errorsList) {
        // Passiamo un messaggio generico al costruttore della classe padre
        super("Errore di validazione nella richiesta.");
        // E salviamo la lista di errori in un campo della nostra classe
        this.errorsList = errorsList;
    }
}
