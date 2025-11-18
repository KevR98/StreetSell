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
            // CONTROLLO UTENTE ATTIVO (Corretto)
            //**************************************************//
            if (!found.isEnabled()) {
                throw new UnauthorizedException("Il tuo account è stato disattivato. Contatta l'assistenza.");
            }
            //**************************************************//

            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority(found.getRuolo().name())
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    found, null, authorities
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            throw new UnauthorizedException("Token non valido, scaduto o utente non trovato. Effettua nuovamente il login.");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        AntPathMatcher matcher = new AntPathMatcher();

        // Rotte da ESCLUDERE dal filtro (rotte pubbliche)
        boolean isAuthRoute = matcher.match("/auth/**", path);

        // Rotta del profilo utente (deve essere protetta)
        boolean isProtectedMeRoute = matcher.match("/prodotti/me", path);

        // Rotte GET pubbliche generali (es. lista prodotti pubblici, dettagli prodotto)
        // Tutta la rotta /prodotti/** è pubblica TRANNE /prodotti/me
        boolean isPublicGet = request.getMethod().equalsIgnoreCase("GET")
                && matcher.match("/prodotti/**", path)
                && !isProtectedMeRoute; // 🛑 ASSICURATI DI NON SALTARE LA ROTTA /me

        // Se la rotta è /prodotti/me, isProtectedMeRoute è TRUE, isPublicGet è FALSE
        // Il filtro sarà eseguito perché la condizione qui sotto sarà FALSE.
        return isAuthRoute || isPublicGet;
    }
}