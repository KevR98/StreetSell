package kevinramil.StreetSell.Entities;

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

    @Lob // Per commenti potenzialmente lunghi
    private String commento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCreazione;

    // --- RELAZIONI FONDAMENTALI ---

    // Relazione: La recensione è legata a un ordine specifico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordine_id", nullable = false)
    private Ordine ordine;

    // Relazione: La recensione è scritta da un utente (il recensore)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recensore_id", nullable = false)
    private Utente recensore;

    // Relazione: La recensione è per un altro utente (il recensito)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recensito_id", nullable = false)
    private Utente recensito;

    // Metodo per impostare la data di creazione automaticamente
    @PrePersist
    public void prePersist() {
        if (dataCreazione == null) {
            dataCreazione = LocalDateTime.now();
        }
    }
}