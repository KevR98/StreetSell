package kevinramil.StreetSell.Payloads;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record UtenteDTO(
        // Username
        @NotEmpty(message = "Il campo username è obbligatorio.")
        @Size(min = 3, max = 20, message = "username deve avere almeno 3 caratteri e max 20")
        String username,


        // Email
        @NotEmpty(message = "Il campo email è obbligatorio.")
        @Email(message = "L'email inserita non ha un formato valido.")
        String email,


        // Password
        @NotEmpty(message = "Il campo password è obbligatorio.")
        @Size(min = 8, message = "La password deve essere almeno di 8 caratteri")
        String password
) {
}
