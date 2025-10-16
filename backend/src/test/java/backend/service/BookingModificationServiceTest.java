package backend.service;

import backend.dto.request.BookingModificationRequest;
import backend.dto.response.BookingModificationResponse;
import backend.entity.Booking;
import backend.entity.BookingModification;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.BookingModificationRepository;
import backend.repository.BookingRepository;
import backend.repository.UserRepository;
import backend.service.impl.BookingModificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingModificationServiceTest {

    @Mock
    private BookingModificationRepository modificationRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingModificationServiceImpl modificationService;

    private User testUser;
    private Booking testBooking;
    private BookingModificationRequest testRequest;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");

        // Create test booking
        testBooking = new Booking();
        testBooking.setId(1L);
        testBooking.setBookingCode("BK123456");
        testBooking.setUser(testUser);
        testBooking.setStartDate(LocalDate.now().plusDays(10)); // 10 days in future
        testBooking.setNumAdults(2);
        testBooking.setNumChildren(0);
        testBooking.setTotalPrice(new BigDecimal("500.00"));
        testBooking.setConfirmationStatus(Booking.ConfirmationStatus.CONFIRMED);

        // Create test modification request
        testRequest = new BookingModificationRequest();
        testRequest.setBookingId(1L);
        testRequest.setModificationType(BookingModificationRequest.ModificationType.DATE_CHANGE);
        testRequest.setNewStartDate(LocalDate.now().plusDays(15)); // Change to 15 days in future
        testRequest.setNewEndDate(LocalDate.now().plusDays(15));
        testRequest.setReason("Schedule conflict");
        testRequest.setCustomerNotes("Need to change due to work commitment");
    }

    @Test
    void testRequestModification_Success() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(modificationRepository.hasActivePendingModification(1L)).thenReturn(false);
        
        BookingModification savedModification = new BookingModification();
        savedModification.setId(1L);
        savedModification.setBooking(testBooking);
        savedModification.setRequestedBy(testUser);
        savedModification.setModificationType(BookingModification.ModificationType.DATE_CHANGE);
        savedModification.setStatus(BookingModification.Status.REQUESTED);
        savedModification.setCreatedAt(LocalDateTime.now());
        
        when(modificationRepository.save(any(BookingModification.class))).thenReturn(savedModification);

        // Act
        BookingModificationResponse response = modificationService.requestModification(1L, testRequest);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("BK123456", response.getBookingCode());
        assertEquals(BookingModificationResponse.ModificationType.DATE_CHANGE, response.getModificationType());
        assertEquals(BookingModificationResponse.Status.REQUESTED, response.getStatus());

        verify(modificationRepository).save(any(BookingModification.class));
    }

    @Test
    void testRequestModification_BookingNotFound() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            modificationService.requestModification(1L, testRequest);
        });
    }

    @Test
    void testRequestModification_UserNotAuthorized() {
        // Arrange
        User anotherUser = new User();
        anotherUser.setId(2L);
        testBooking.setUser(anotherUser); // Different user owns the booking
        
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            modificationService.requestModification(1L, testRequest);
        });
    }

    @Test
    void testRequestModification_PendingModificationExists() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(modificationRepository.hasActivePendingModification(1L)).thenReturn(true);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            modificationService.requestModification(1L, testRequest);
        });
    }

    @Test
    void testCalculatePriceDifference_AdditionalParticipants() {
        // Arrange
        testRequest.setModificationType(BookingModificationRequest.ModificationType.PARTICIPANT_CHANGE);
        testRequest.setNewParticipants(4); // Increase from 2 to 4
        
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BigDecimal priceDifference = modificationService.calculatePriceDifference(1L, testRequest);

        // Assert
        assertEquals(new BigDecimal("200.00"), priceDifference); // 2 additional * $100 each
    }

    @Test
    void testCalculatePriceDifference_FewerParticipants() {
        // Arrange
        testRequest.setModificationType(BookingModificationRequest.ModificationType.PARTICIPANT_CHANGE);
        testRequest.setNewParticipants(1); // Decrease from 2 to 1
        
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BigDecimal priceDifference = modificationService.calculatePriceDifference(1L, testRequest);

        // Assert
        assertEquals(new BigDecimal("-80.00"), priceDifference); // 1 fewer * $80 refund
    }

    @Test
    void testCalculateProcessingFee() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BigDecimal processingFee = modificationService.calculateProcessingFee(1L, testRequest);

        // Assert
        assertEquals(new BigDecimal("25.00"), processingFee);
    }

    @Test
    void testValidateModificationRequest_ValidRequest() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(modificationRepository.hasActivePendingModification(1L)).thenReturn(false);

        // Act
        BookingModificationService.ValidationResult result = 
            modificationService.validateModificationRequest(1L, testRequest);

        // Assert
        assertTrue(result.isValid());
        assertNull(result.getErrorMessage());
    }

    @Test
    void testValidateModificationRequest_BookingNotConfirmed() {
        // Arrange
        testBooking.setConfirmationStatus(Booking.ConfirmationStatus.PENDING);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BookingModificationService.ValidationResult result = 
            modificationService.validateModificationRequest(1L, testRequest);

        // Assert
        assertFalse(result.isValid());
        assertEquals("Only confirmed bookings can be modified.", result.getErrorMessage());
    }

    @Test
    void testValidateModificationRequest_TourStartedOrTooSoon() {
        // Arrange
        testBooking.setStartDate(LocalDate.now().plusDays(1)); // Only 1 day in future (< 48 hours)
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BookingModificationService.ValidationResult result = 
            modificationService.validateModificationRequest(1L, testRequest);

        // Assert
        assertFalse(result.isValid());
        assertTrue(result.getErrorMessage().contains("48 hours"));
    }

    @Test
    void testCanBookingBeModified_True() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(modificationRepository.hasActivePendingModification(1L)).thenReturn(false);

        // Act
        boolean canModify = modificationService.canBookingBeModified(1L);

        // Assert
        assertTrue(canModify);
    }

    @Test
    void testCanBookingBeModified_False() {
        // Arrange
        testBooking.setConfirmationStatus(Booking.ConfirmationStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        boolean canModify = modificationService.canBookingBeModified(1L);

        // Assert
        assertFalse(canModify);
    }

    @Test
    void testGetPriceQuote() {
        // Arrange
        testRequest.setNewParticipants(3); // Change from 2 to 3
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        BookingModificationResponse.PricingDetails pricing = 
            modificationService.getPriceQuote(1L, testRequest);

        // Assert
        assertNotNull(pricing);
        assertEquals(new BigDecimal("500.00"), pricing.getOriginalAmount());
        assertEquals(new BigDecimal("100.00"), pricing.getPriceDifference()); // 1 additional * $100
        assertEquals(new BigDecimal("25.00"), pricing.getProcessingFee());
        assertEquals(new BigDecimal("125.00"), pricing.getTotalAdditionalAmount()); // $100 + $25
        assertTrue(pricing.getRequiresAdditionalPayment());
        assertFalse(pricing.getOffersRefund());
    }
}
