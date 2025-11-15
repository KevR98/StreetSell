package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.NotEmpty;

public record IndirizzoDTO(

        // Via
        @NotEmpty(message = "La via è obbligatoria")
        String via,

        // Città
        @NotEmpty(message = "La città è obbligatorio")
        String citta,

        // Cap
        @NotEmpty(message = "Il cap è obbligatorio")
        String cap,

        // Provincia
        @NotEmpty(message = "La provincia è obbligatoria")
        String provincia,

        @NotEmpty(message = "La nazione è obbligatoria")
        String nazione
) {
}
