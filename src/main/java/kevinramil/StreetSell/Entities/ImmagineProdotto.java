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
@Table(name = "immagini_prodotti")
public class ImmagineProdotto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false)
    private String url; // L'URL dell'immagine salvata (es. su Cloudinary, AWS S3, ecc.)

    // Relazione: Molte immagini appartengono a un solo prodotto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prodotto_id", nullable = false)
    @JsonIgnore
    private Prodotto prodotto;
}