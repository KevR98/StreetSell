package kevinramil.StreetSell.Repositories;

import kevinramil.StreetSell.Entities.ImmagineProdotto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImmagineProdottoRepository extends JpaRepository<ImmagineProdotto, UUID> {

}
