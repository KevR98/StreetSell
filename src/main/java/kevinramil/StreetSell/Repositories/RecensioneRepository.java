package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Recensione;
import kevinramil.StreetSell.Entities.Utente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecensioneRepository extends JpaRepository<Recensione, UUID> {

    // Trova tutte le recensioni ricevute da un utente specifico
    Page<Recensione> findByRecensito(Utente recensito, Pageable pageable);

    boolean existsByOrdineId(UUID ordineId);

    @Query("SELECT AVG(r.valutazione) FROM Recensione r WHERE r.recensito = :utente")
    Double calcolaMediaRating(@Param("utente") Utente utente);

    int countByRecensito(Utente recensito);
}