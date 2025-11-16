package kevinramil.StreetSell.Payloads;

// Avremo bisogno dell'Utente per prendere i dati

import kevinramil.StreetSell.Entities.Utente;

import java.util.UUID;

public record LoginResponseDTO(String token, UserInfo user) {

    // Costruttore principale per creare l'oggetto di risposta
    public LoginResponseDTO(String token, Utente utente) {
        this(token, new UserInfo(utente));
    }

    // Sottoclasse/Record interno per i dati utente
    public record UserInfo(UUID id, String username, String email) {
        // Costruttore che prende l'oggetto Utente e crea l'UserInfo pulito
        public UserInfo(Utente utente) {
            this(utente.getId(), utente.getUsername(), utente.getEmail());
        }
    }
}