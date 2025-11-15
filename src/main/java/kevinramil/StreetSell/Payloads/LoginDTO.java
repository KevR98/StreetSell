package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.NotEmpty;

public record LoginDTO(
        @NotEmpty(message = "Il campo email è obbligatorio.")
        String email,

        @NotEmpty(message = "Il campo password è obbligatorio.")
        String password
) {
}
