package kevinramil.StreetSell.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import kevinramil.StreetSell.Enums.Ruolo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

// 2. ANNOTAZIONI DELLA CLASSE
// ============================
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@ToString
@Entity
@Table(name = "utenti")
// 🚨 RIMOZIONE DELLA CHIAVE DI BLOCCO: NON USIAMO JsonIgnoreProperties QUI 🚨
public class Utente implements UserDetails {

    // 3. CAMPI DELL'ENTITÀ
    // ====================
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = true)
    private String nome;

    @Column(nullable = true)
    private String cognome;

    private String username;
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private Ruolo ruolo;

    @Column(name = "is_attivo")
    private Boolean attivo = true;

    @Column(updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "venditore")
    @ToString.Exclude
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.ruolo.name()));
    }


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

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return this.password;
    }
}