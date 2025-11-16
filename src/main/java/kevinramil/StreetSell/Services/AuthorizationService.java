package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.Ruolo;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.UnauthorizedException;
import kevinramil.StreetSell.Payloads.LoginDTO;
import kevinramil.StreetSell.Payloads.LoginResponseDTO;
import kevinramil.StreetSell.Payloads.UtenteDTO;
import kevinramil.StreetSell.Repositories.UtenteRepository;
import kevinramil.StreetSell.Securities.JWTTools;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTTools jwtTools;

    public Utente registraUtente(UtenteDTO body) {
        utenteRepository.findByEmail(body.email()).ifPresent(utente -> {
            throw new BadRequestException("L'email " + utente.getEmail() + " è già in uso!");
        });
        utenteRepository.findByUsername(body.username()).ifPresent(utente -> {
            throw new BadRequestException("Lo username " + utente.getUsername() + " è già in uso!");
        });

        Utente nuovoUtente = new Utente();
        nuovoUtente.setUsername(body.username());
        nuovoUtente.setEmail(body.email());

        nuovoUtente.setAttivo(true);

        // <-- MODIFICA CRUCIALE: Ora criptiamo la password!
        nuovoUtente.setPassword(passwordEncoder.encode(body.password()));

        nuovoUtente.setRuolo(Ruolo.USER);
        return utenteRepository.save(nuovoUtente);
    }

    // 🛑 MODIFICA QUI: Il metodo ora restituisce LoginResponseDTO
    public LoginResponseDTO authenticateAndGenerateToken(LoginDTO body) {
        Utente utente = utenteRepository.findByEmail(body.email())
                .orElseThrow(() -> new UnauthorizedException("Credenziali non valide."));

        // <-- Confrontiamo la password usando il metodo sicuro di BCrypt
        if (passwordEncoder.matches(body.password(), utente.getPassword())) {

            // 1. Generiamo il token
            String token = jwtTools.createToken(utente);

            // 2. ✅ AZIONE CRUCIALE: Restituiamo il DTO completo con token E utente
            return new LoginResponseDTO(token, utente);

        } else {
            throw new UnauthorizedException("Credenziali non valide.");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Non farti ingannare dal nome 'loadUserByUsername'.
        // La stringa che arriva qui è quella che l'utente scrive nel campo "username" del form di login,
        // che per noi è l'email.

        return utenteRepository.findByEmail(email) // Cerchiamo nel DB per email
                .orElseThrow(() -> new UsernameNotFoundException("Utente con email " + email + " non trovato"));
    }
}