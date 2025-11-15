package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, UUID> {
    Optional<Utente> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Utente> findByUsername(String username);

    boolean existsByUsername(String username);
}
