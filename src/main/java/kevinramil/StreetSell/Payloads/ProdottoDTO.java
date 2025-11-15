package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import kevinramil.StreetSell.Enums.Condizione;

import java.math.BigDecimal;
import java.util.List;

public record ProdottoDTO(
        @NotEmpty(message = "Il titolo è obbligatorio.")
        String titolo,

        String descrizione,

        @NotNull(message = "Il prezzo è obbligatorio.")
        @Min(value = 0, message = "Il prezzo non può essere negativo.")
        BigDecimal prezzo,

        String categoria,

        @NotNull(message = "La condizione del prodotto è obbligatoria.")
        Condizione condizione,

        // Lista degli URL delle immagini del prodotto
        List<String> imageUrls
) {
}