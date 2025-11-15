package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Recensione;
import kevinramil.StreetSell.Entities.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecensioneRepository extends JpaRepository<Recensione, UUID> {

    // Trova tutte le recensioni ricevute da un utente specifico
    List<Recensione> findByRecensito(Utente recensito);

    // Controlla se esiste già una recensione per un dato ordine.
    // È essenziale per la logica del RecensioneService per evitare recensioni duplicate.
    boolean existsByOrdineId(UUID ordineId);
}