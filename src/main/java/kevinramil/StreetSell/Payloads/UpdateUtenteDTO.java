package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.NotEmpty;

public record UpdateUtenteDTO(
        @NotEmpty(message = "Il campo nome è obbligatorio.")
        String nome,

        @NotEmpty(message = "Il campo cognome è obbligatorio.")
        String cognome
) {
}

