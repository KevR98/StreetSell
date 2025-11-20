package kevinramil.StreetSell.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import kevinramil.StreetSell.Enums.Condizione;
import kevinramil.StreetSell.Enums.StatoProdotto;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Table(name = "prodotti")
public class Prodotto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false)
    private String titolo;

    @Column(columnDefinition = "TEXT")
    private String descrizione;

    @Column(nullable = false)
    private BigDecimal prezzo;

    private String categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Condizione condizione;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoProdotto statoProdotto;

    @Column(updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Relazione: Molti prodotti possono appartenere a un solo venditore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venditore_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "prodottiVenduti"})
    private Utente venditore;

    @OneToMany(mappedBy = "prodotto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("prodotto")
    private List<ImmagineProdotto> immagini;
}