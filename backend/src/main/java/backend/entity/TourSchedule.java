package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tour_schedules", indexes = {
    @Index(name = "idx_schedules_tour", columnList = "tour_id"),
    @Index(name = "idx_schedules_departure_date", columnList = "departure_date"),
    @Index(name = "idx_schedules_status", columnList = "status")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TourSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    @JsonIgnore
    private Tour tour;
    
    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;
    
    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;
    
    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;
    
    @Column(name = "booked_seats", nullable = false)
    private Integer bookedSeats = 0;
    
    @Column(name = "adult_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal adultPrice;
    
    @Column(name = "child_price", precision = 12, scale = 2)
    private BigDecimal childPrice;
    
    @Column(name = "infant_price", precision = 12, scale = 2)
    private BigDecimal infantPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status = ScheduleStatus.AVAILABLE;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean hasAvailableSeats(int requestedSeats) {
        return availableSeats >= requestedSeats;
    }
    
    public void bookSeats(int seats) {
        if (!hasAvailableSeats(seats)) {
            throw new IllegalStateException("Not enough available seats");
        }
        this.bookedSeats += seats;
        this.availableSeats -= seats;
        
        if (this.availableSeats == 0) {
            this.status = ScheduleStatus.FULL;
        }
    }
    
    public void releaseSeats(int seats) {
        this.bookedSeats -= seats;
        this.availableSeats += seats;
        
        if (this.status == ScheduleStatus.FULL && this.availableSeats > 0) {
            this.status = ScheduleStatus.AVAILABLE;
        }
    }
    
    public enum ScheduleStatus {
        AVAILABLE,      // Còn chỗ
        FULL,          // Đã đầy
        CONFIRMED,     // Đã xác nhận khởi hành
        CANCELLED,     // Đã hủy
        COMPLETED      // Đã hoàn thành
    }
}
