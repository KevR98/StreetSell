package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Ordine;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoOrdine;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrdineRepository extends JpaRepository<Ordine, UUID> {
    // Trova tutti gli ordini effettuati da un compratore
    List<Ordine> findByCompratore(Utente compratore);

    @EntityGraph(attributePaths = {"prodotto", "compratore", "indirizzoSpedizione"})
    List<Ordine> findByVenditoreAndStatoOrdine(Utente venditore, StatoOrdine statoOrdine, Sort sort);

    @EntityGraph(attributePaths = {"prodotto"})
    List<Ordine> findByCompratoreAndStatoOrdine(Utente compratore, StatoOrdine statoOrdine, Sort sort);

    long countByVenditoreAndStatoOrdine(Utente venditore, StatoOrdine statoOrdine);

    @Query("SELECT o FROM Ordine o " +
            "LEFT JOIN FETCH o.prodotto p " +
            "LEFT JOIN FETCH p.venditore pv " +
            "LEFT JOIN FETCH o.compratore c " +
            "WHERE o.id = :id")
    Optional<Ordine> findByIdForUpdate(@Param("id") UUID id);

}
