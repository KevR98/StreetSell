package kevinramil.StreetSell.Securities;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JWTTools {
    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String createToken(Utente utente) {
        return Jwts.builder()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 14)) // 14 giorni
                .subject(String.valueOf(utente.getId()))
                .signWith(getSecretKey())
                .compact();
    }

    public void verifyToken(String accessToken) {
        try {
            Jwts.parser().verifyWith(getSecretKey()).build().parse(accessToken);
        } catch (Exception exception) {
            throw new UnauthorizedException("Token non valido. Per favore, effettua di nuovo il login.");
        }
    }

    public UUID extractIdFromToken(String token) {
        // Metodo moderno e non deprecato per estrarre il subject (ID utente)
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            throw new UnauthorizedException("Token non valido o scaduto.");
        }
    }
}
