package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Enums.StatoProdotto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProdottoRepository extends JpaRepository<Prodotto, UUID> {
    Page<Prodotto> findByStatoProdotto(StatoProdotto statoProdotto, Pageable pageable);
}
