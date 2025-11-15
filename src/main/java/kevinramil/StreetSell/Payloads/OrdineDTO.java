package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OrdineDTO(
        @NotNull(message = "L'ID del prodotto è obbligatorio.")
        UUID prodottoId,

        @NotNull(message = "L'ID dell'indirizzo di spedizione è obbligatorio.")
        UUID indirizzoId
) {
}