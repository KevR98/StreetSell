package kevinramil.StreetSell.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import kevinramil.StreetSell.Enums.StatoOrdine;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Table(name = "ordini")
public class Ordine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    // Relazione: Un ordine ha un solo compratore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compratore_id", nullable = false)
    private Utente compratore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venditore_id", nullable = false)
    private Utente venditore;

    // Relazione: Un ordine è per un solo prodotto
    @ManyToOne
    @JoinColumn(name = "prodotto_id", referencedColumnName = "id")
    private Prodotto prodotto;

    @Column(nullable = false)
    private LocalDateTime dataOrdine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoOrdine statoOrdine;

    // Relazione: Un ordine può avere più recensioni (di solito una dal compratore e una dal venditore)
    @OneToOne(mappedBy = "ordine", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.JOIN)
    @JsonIgnoreProperties("ordine")
    private Recensione recensione;

    // Relazione: L'ordine viene spedito a un indirizzo specifico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indirizzo_spedizione_id", nullable = false)
    private Indirizzo indirizzoSpedizione;
}
