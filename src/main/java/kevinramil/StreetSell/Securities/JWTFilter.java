package kevinramil.StreetSell.Securities;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.UnauthorizedException;
import kevinramil.StreetSell.Services.UtenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTTools jwtTools;

    @Autowired
    private UtenteService utenteService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authHeader.replace("Bearer ", "").trim();

        try {
            jwtTools.verifyToken(accessToken);

            UUID utenteId = jwtTools.extractIdFromToken(accessToken);
            Utente found = utenteService.findById(utenteId);

            //**************************************************//
            // AGGIUNGI QUESTO CONTROLLO SUBITO DOPO AVER TROVATO L'UTENTE
            //**************************************************//
            if (!found.isEnabled()) { // .isEnabled() userà il campo 'attivo' che abbiamo aggiunto
                throw new UnauthorizedException("Il tuo account è stato disattivato. Contatta l'assistenza.");
            }
            //**************************************************//

            // Se la tua entità Utente NON implementa UserDetails, crea le authorities dal ruolo
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority(found.getRuolo().name()) // Non serve "ROLE_", @PreAuthorize lo vuole senza
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    found, null, authorities
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Se l'eccezione è già UnauthorizedException, rilanciala. Altrimenti, creane una nuova.
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            throw new UnauthorizedException("Token non valido, scaduto o utente non trovato. Effettua nuovamente il login.");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return new AntPathMatcher().match("/auth/**", request.getServletPath());
    }
}