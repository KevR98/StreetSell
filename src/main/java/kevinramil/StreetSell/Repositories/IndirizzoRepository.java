package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Indirizzo;
import kevinramil.StreetSell.Entities.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IndirizzoRepository extends JpaRepository<Indirizzo, UUID> {
    // Trova tutti gli indirizzi appartenenti a un utente
    List<Indirizzo> findByUtente(Utente utente);
}
