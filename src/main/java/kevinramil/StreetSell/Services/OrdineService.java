package kevinramil.StreetSell.Services;

import kevinramil.StreetSell.Entities.Indirizzo;
import kevinramil.StreetSell.Entities.Ordine;
import kevinramil.StreetSell.Entities.Prodotto;
import kevinramil.StreetSell.Entities.Utente;
import kevinramil.StreetSell.Enums.StatoOrdine;
import kevinramil.StreetSell.Enums.StatoProdotto;
import kevinramil.StreetSell.Exceptions.BadRequestException;
import kevinramil.StreetSell.Exceptions.NotFoundException;
import kevinramil.StreetSell.Payloads.OrdineDTO;
import kevinramil.StreetSell.Payloads.OrdineStatoDTO;
import kevinramil.StreetSell.Repositories.IndirizzoRepository;
import kevinramil.StreetSell.Repositories.OrdineRepository;
import kevinramil.StreetSell.Repositories.ProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrdineService {

    @Autowired
    private OrdineRepository ordineRepository;
    @Autowired
    private ProdottoRepository prodottoRepository;
    @Autowired
    private IndirizzoRepository indirizzoRepository;

    @Transactional
    public Ordine creaOrdine(OrdineDTO ordineDTO, Utente compratore) {
        Prodotto prodotto = prodottoRepository.findById(ordineDTO.prodottoId())
                .orElseThrow(() -> new NotFoundException("Prodotto con ID " + ordineDTO.prodottoId() + " non trovato"));

        Indirizzo indirizzo = indirizzoRepository.findById(ordineDTO.indirizzoId())
                .orElseThrow(() -> new NotFoundException("Indirizzo con ID " + ordineDTO.indirizzoId() + " non trovato"));

        if (prodotto.getStatoProdotto() != StatoProdotto.DISPONIBILE) {
            throw new BadRequestException("Il prodotto '" + prodotto.getTitolo() + "' non è più disponibile");
        }
        if (prodotto.getVenditore().getId().equals(compratore.getId())) {
            throw new BadRequestException("Non puoi acquistare un tuo stesso prodotto.");
        }
        if (!indirizzo.getUtente().getId().equals(compratore.getId())) {
            throw new BadRequestException("L'indirizzo di spedizione scelto non appartiene al tuo profilo");
        }

        prodotto.setStatoProdotto(StatoProdotto.VENDUTO);
        prodottoRepository.save(prodotto);

        Ordine nuovoOrdine = new Ordine();
        nuovoOrdine.setCompratore(compratore);
        nuovoOrdine.setVenditore(prodotto.getVenditore());
        nuovoOrdine.setProdotto(prodotto);
        nuovoOrdine.setIndirizzoSpedizione(indirizzo);
        nuovoOrdine.setStatoOrdine(StatoOrdine.CONFERMATO);
        nuovoOrdine.setDataOrdine(LocalDateTime.now());

        return ordineRepository.save(nuovoOrdine);
    }

    // Metodo per aggiornare lo stato dell'ordine
    @Transactional
    public Ordine aggiornaStatoOrdine(UUID ordineId, OrdineStatoDTO ordineStatoDTO, Utente utenteCorrente) {

        Ordine ordine = ordineRepository.findByIdForUpdate(ordineId)
                .orElseThrow(() -> new NotFoundException("Ordine con ID " + ordineId + " non trovato"));

        StatoOrdine nuovoStato = ordineStatoDTO.nuovoStato();

        Utente venditore = ordine.getProdotto().getVenditore();
        Utente compratore = ordine.getCompratore();

        // Struttura di controllo che permette di cambiare lo stato dell'ordine da parte dell'utente
        switch (nuovoStato) {

            case SPEDITO:
                if (!venditore.getId().equals(utenteCorrente.getId())) {
                    throw new BadRequestException("Solo il venditore può modificare lo stato come 'SPEDITO'");
                }

                if (ordine.getStatoOrdine() != StatoOrdine.CONFERMATO) {
                    throw new BadRequestException("Puoi spedire solo quando l'ordine è con lo stato 'CONFERMATO'");
                }

                break;

            case COMPLETATO:
                if (!compratore.getId().equals(utenteCorrente.getId())) {
                    throw new BadRequestException("Solo il compratore può modificare lo stato come COMPLETATO");
                }

                if (ordine.getStatoOrdine() != StatoOrdine.SPEDITO) {
                    throw new BadRequestException("Puoi contrassegnare l'ordine come 'COMPLETATO' solo dopo che è stato spedito");
                }

                break;

            case ANNULLATO:
                if (!venditore.getId().equals(utenteCorrente.getId()) && !compratore.getId().equals(utenteCorrente.getId())) {
                    throw new BadRequestException("Non hai i permessi per annullare l'ordine");
                }

                if (ordine.getStatoOrdine() != StatoOrdine.CONFERMATO && ordine.getStatoOrdine() != StatoOrdine.IN_ATTESA) {
                    throw new BadRequestException("Un ordine può essere annullato solo se è in stato 'CONFERMATO' o 'IN_ATTESA'");
                }

                // Questo metodo rimette il prodotto disponibile quando viene annulato
                Prodotto prodotto = ordine.getProdotto();
                prodotto.setStatoProdotto(StatoProdotto.DISPONIBILE);
                prodottoRepository.save(prodotto);

                break;

            default:
                throw new BadRequestException("Stato '" + nuovoStato + "' non valido per l'aggiornamento");

        }

        ordine.setStatoOrdine(nuovoStato);

        return ordineRepository.save(ordine);
    }


    public List<Ordine> findOrdiniUtenteCompleto(Utente utenteCorrente) {

        // 1. Ordini che devo spedire (sono il VENDITORE, Stato: CONFERMATO)
        List<Ordine> ordiniVenditore = ordineRepository.findByVenditoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.CONFERMATO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        // 2. Ordini che ho comprato e devo confermare (sono il COMPRATORE, Stato: SPEDITO)
        List<Ordine> ordiniCompratore = ordineRepository.findByCompratoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.SPEDITO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        List<Ordine> ordiniVenditoreNotifica = ordineRepository.findByVenditoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.COMPLETATO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        List<Ordine> ordiniCompratoreAnnullabili = ordineRepository.findByCompratoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.CONFERMATO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        // Per una notifica temporanea, dovresti aggiungere un filtro di data nel service o repository.
        List<Ordine> ordiniVenditoreAnnullati = ordineRepository.findByVenditoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.ANNULLATO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        List<Ordine> ordiniCompratoreCompletati = ordineRepository.findByCompratoreAndStatoOrdine(
                utenteCorrente,
                StatoOrdine.COMPLETATO,
                Sort.by(Sort.Direction.DESC, "dataOrdine")
        );

        // Uniamo le due liste
        List<Ordine> tutteLeTask = new java.util.ArrayList<>();
        tutteLeTask.addAll(ordiniVenditore);
        tutteLeTask.addAll(ordiniCompratore);
        tutteLeTask.addAll(ordiniCompratoreAnnullabili);
        tutteLeTask.addAll(ordiniVenditoreAnnullati);
        tutteLeTask.addAll(ordiniVenditoreNotifica);
        tutteLeTask.addAll(ordiniCompratoreCompletati);

        // Ordiniamo la lista finale (opzionale, ma utile per la visualizzazione)
        tutteLeTask.sort((o1, o2) -> o2.getDataOrdine().compareTo(o1.getDataOrdine()));

        return tutteLeTask;
    }
}