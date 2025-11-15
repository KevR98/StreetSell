package kevinramil.StreetSell.Exceptions;

import java.util.UUID;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message, UUID id) {
        super(message);
    }

    public NotFoundException(String message) {
        super(message);
    }
}
