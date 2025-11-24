package kevinramil.StreetSell.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "recensioni")
public class Recensione {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false)
    private int valutazione; // Es. un valore da 1 a 5

    @Column(columnDefinition = "TEXT")
    private String commento;

    @Column(updatable = false, nullable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime dataCreazione;

    // --- RELAZIONI FONDAMENTALI ---

    // Relazione: La recensione è legata a un ordine specifico
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordine_id", nullable = false, unique = true) // 🛑 unique=true impone l'unicità
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "recensione"})
    private Ordine ordine;

    // Relazione: La recensione è scritta da un utente (il recensore)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recensore_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "prodotti", "indirizzi", "password", "recensioni", "authorities"})
    private Utente recensore;

    // Relazione: La recensione è per un altro utente (il recensito)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recensito_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "prodotti", "indirizzi", "password", "recensioni", "authorities"})
    private Utente recensito;

}