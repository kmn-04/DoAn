package backend.repository;

import backend.entity.PointVoucher;
import backend.entity.PointVoucher.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointVoucherRepository extends JpaRepository<PointVoucher, Long> {
    
    /**
     * Find voucher by code
     */
    Optional<PointVoucher> findByVoucherCode(String voucherCode);
    
    /**
     * Find voucher by code with user (fetch join to avoid lazy loading)
     */
    @Query("SELECT DISTINCT pv FROM PointVoucher pv JOIN FETCH pv.user WHERE pv.voucherCode = :code")
    Optional<PointVoucher> findByVoucherCodeWithUser(@Param("code") String code);
    
    /**
     * Find vouchers by user ID
     */
    List<PointVoucher> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find vouchers by user ID with pagination
     */
    Page<PointVoucher> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find active vouchers by user ID
     */
    @Query("SELECT pv FROM PointVoucher pv WHERE pv.user.id = :userId AND pv.status = 'ACTIVE' AND pv.expiresAt >= :currentDate ORDER BY pv.expiresAt ASC")
    List<PointVoucher> findActiveVouchersByUserId(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);
    
    /**
     * Find vouchers by status
     */
    List<PointVoucher> findByStatus(VoucherStatus status);
    
    /**
     * Find expired vouchers that haven't been marked as expired
     */
    @Query("SELECT pv FROM PointVoucher pv WHERE pv.expiresAt < :currentDate AND pv.status = 'ACTIVE'")
    List<PointVoucher> findExpiredVouchers(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Check if voucher code exists
     */
    boolean existsByVoucherCode(String voucherCode);
    
    /**
     * Count vouchers by user and status
     */
    Long countByUserIdAndStatus(Long userId, VoucherStatus status);
    
    /**
     * Find voucher by code and user
     */
    @Query("SELECT pv FROM PointVoucher pv WHERE pv.voucherCode = :code AND pv.user.id = :userId")
    Optional<PointVoucher> findByVoucherCodeAndUserId(@Param("code") String code, @Param("userId") Long userId);
    
    /**
     * Get total vouchers value by user
     */
    @Query("SELECT SUM(pv.voucherValue) FROM PointVoucher pv WHERE pv.user.id = :userId AND pv.status = 'ACTIVE'")
    Double getTotalActiveVoucherValueByUserId(@Param("userId") Long userId);
}

