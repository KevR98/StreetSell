package kevinramil.StreetSell.Runners; // O il package che preferisci

import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Repositories.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class StreetSellRunner implements CommandLineRunner {

    @Autowired
    private UtenteRepository utenteRepository;

    @Override
    public void run(String... args) throws Exception {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.println("Timestamp         : " + timestamp);
        // 1. Trova TUTTI gli utenti dal DB (come prima)
        List<Utente> tuttiGliUtentiDalDB = utenteRepository.findAll();

        // 2. FILTRA la lista per tenere solo quelli ATTIVI
        List<Utente> utentiAttivi = tuttiGliUtentiDalDB.stream()
                .filter(utente -> utente.getAttivo() != null && utente.getAttivo())
                .toList();

        System.out.println("------------------------------------------------------------");
        // 3. Stampa il conteggio degli utenti ATTIVI
        System.out.println("Profili Utente ATTIVI nel Database: " + utentiAttivi.size());

        // 4. Itera e stampa solo gli utenti ATTIVI
        for (Utente utente : utentiAttivi) {
            System.out.println("- (Username: " + utente.getUsername() + ")" + " (Email: " + utente.getEmail() + ")");
        }

        System.out.println("------------------------------------------------------------\n");
    }
}