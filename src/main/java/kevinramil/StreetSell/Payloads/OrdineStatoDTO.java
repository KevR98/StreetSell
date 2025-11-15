package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.NotNull;
import kevinramil.StreetSell.Enums.StatoOrdine;

public record OrdineStatoDTO(
        @NotNull(message = "Lo stato dell'ordine non può essere nullo.")
        StatoOrdine nuovoStato
) {
}
