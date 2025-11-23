package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Ordine;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoOrdine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrdineRepository extends JpaRepository<Ordine, UUID> {
    // Trova tutti gli ordini effettuati da un compratore
    List<Ordine> findByCompratore(Utente compratore);

    long countByVenditoreAndStatoOrdine(Utente venditore, StatoOrdine statoOrdine);

}
