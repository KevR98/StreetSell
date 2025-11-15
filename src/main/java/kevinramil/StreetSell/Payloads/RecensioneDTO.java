package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RecensioneDTO(
        @NotNull(message = "L'ID dell'ordine è obbligatorio.")
        UUID ordineId,

        @NotNull(message = "La valutazione è obbligatoria.")
        @Min(value = 1, message = "La valutazione deve essere almeno 1.")
        @Max(value = 5, message = "La valutazione non può superare 5.")
        Integer valutazione,

        String commento // Il commento può essere opzionale
) {
}