package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoProdotto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProdottoRepository extends JpaRepository<Prodotto, UUID> {
    @EntityGraph(attributePaths = {"venditore"})
    Page<Prodotto> findByStatoProdotto(StatoProdotto statoProdotto, Pageable pageable);

    @EntityGraph(attributePaths = {"venditore"})
    Page<Prodotto> findByVenditore(Utente venditore, Pageable pageable);

}
