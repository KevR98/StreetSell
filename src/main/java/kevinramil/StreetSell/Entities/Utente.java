package kevinramil.StreetSell.Entities;

// 1. IMPORT NECESSARI (Controlla che ci siano tutti)
// ===================================================

// Per la conversione in JSON

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import kevinramil.StreetSell.Enums.Ruolo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

// 2. ANNOTAZIONI DELLA CLASSE
// ============================
@Getter
@Setter
@NoArgsConstructor
@ToString
@Entity
@Table(name = "utenti")
@JsonIgnoreProperties({"password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
public class Utente implements UserDetails { // <-- Implementiamo l'interfaccia di Spring Security

    // 3. CAMPI DELL'ENTITÀ
    // ====================
    @Id
    @GeneratedValue
    private UUID id;

    private String username;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Ruolo ruolo; // Assumendo che tu abbia un Enum 'Role' (es. ADMIN, USER)

    @Column(name = "is_attivo")
    private Boolean attivo = true;

    // 4. RELAZIONI CON LE ALTRE TABELLE (con @JsonIgnore)
    // ====================================================
    // Aggiungiamo @JsonIgnore per evitare la LazyInitializationException e i loop infiniti.
    // Diciamo a Jackson: "Quando crei il JSON, ignora questi campi".

    @OneToMany(mappedBy = "venditore")
    @ToString.Exclude // Evita loop infiniti anche nel metodo toString() di Lombok
    @JsonIgnore
    private List<Prodotto> prodottodaVendere;

    @OneToMany(mappedBy = "compratore")
    @ToString.Exclude
    @JsonIgnore
    private List<Ordine> ordiniAcquirente;

    @OneToMany(mappedBy = "recensore")
    @ToString.Exclude
    @JsonIgnore
    private List<Recensione> recensioniFatte;

    @OneToMany(mappedBy = "recensito")
    @ToString.Exclude
    @JsonIgnore
    private List<Recensione> recensioniRicevute;

    @OneToMany(mappedBy = "utente")
    @ToString.Exclude
    @JsonIgnore
    private List<Indirizzo> indirizzi;


    // 5. METODI RICHIESTI DALL'INTERFACCIA UserDetails
    // ===============================================
    // Questi metodi sono FONDAMENTALI per Spring Security.

    /**
     * Restituisce i "poteri" (ruoli) dell'utente.
     * Spring Security usa questo metodo per l'autorizzazione (es. @PreAuthorize).
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.ruolo.name()));
    }

    // Gli altri metodi di UserDetails. Per ora, li facciamo restituire 'true'
    // per indicare che l'account è sempre attivo e valido.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}