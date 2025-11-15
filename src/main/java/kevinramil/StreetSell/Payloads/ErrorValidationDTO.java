package kevinramil.StreetSell.Payloads;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorValidationDTO(String message, LocalDateTime timeStamp, List<String> errorList) {
}
