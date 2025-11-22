package kevinramil.StreetSell.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "indirizzi")
public class Indirizzo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false)
    private String via;

    @Column(nullable = false)
    private String citta;

    @Column(nullable = false)
    private String cap; // Codice di Avviamento Postale

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String nazione;

    // Relazione: Molti indirizzi possono appartenere a un solo utente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    @JsonIgnore
    private Utente utente;
}