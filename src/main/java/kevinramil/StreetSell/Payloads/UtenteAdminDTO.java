package kevinramil.StreetSell.Payloads;

import kevinramil.StreetSell.Entities.Utente;

import java.time.LocalDateTime;
import java.util.UUID;

public record UtenteAdminDTO(
        UUID id,
        String username,
        String email,
        String ruolo,
        Boolean attivo,
        LocalDateTime createdAt, // Assumendo Utente.java ha createdAt
        long prodottiAttiviCount
) {
    // Metodo helper per mappare l'Entità Utente e il conteggio
    public static UtenteAdminDTO fromUtente(Utente u, long count) {
        return new UtenteAdminDTO(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRuolo().name(),
                u.getAttivo(),
                // Usiamo il campo createdAt dell'Utente se presente, altrimenti la data corrente
                u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now(),
                count
        );
    }
}
