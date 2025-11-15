package kevinramil.StreetSell.Payloads;

import java.time.LocalDateTime;

public record ErrorDTO(String message, LocalDateTime timeStamp) {
}
