package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoProdotto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProdottoRepository extends JpaRepository<Prodotto, UUID> {
    @EntityGraph(attributePaths = {"venditore"})
    Page<Prodotto> findByStatoProdotto(StatoProdotto statoProdotto, Pageable pageable);

    @EntityGraph(attributePaths = {"venditore"})
    Page<Prodotto> findByVenditore(Utente venditore, Pageable pageable);

    @Query("SELECT p FROM Prodotto p JOIN p.venditore v WHERE p.statoProdotto = 'DISPONIBILE' AND " +
            // Ricerca generica (titolo/descrizione)
            "(:query IS NULL OR LOWER(p.titolo) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.descrizione) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            // Filtro Categoria
            "(:categoria IS NULL OR LOWER(p.categoria) = LOWER(:categoria)) AND " +
            // Filtro Venditore
            "(:username IS NULL OR LOWER(v.username) = LOWER(:username))")
    Page<Prodotto> findByMultipleCriteria(
            @Param("query") String query,
            @Param("categoria") String categoria,
            @Param("username") String username,
            Pageable pageable);
}
