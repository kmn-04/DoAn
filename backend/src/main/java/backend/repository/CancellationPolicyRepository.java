package backend.repository;

import backend.entity.CancellationPolicy;
import backend.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, Long> {

    // Find active policies
    List<CancellationPolicy> findByStatusOrderByPriorityDesc(CancellationPolicy.PolicyStatus status);

    // Find policies by type
    List<CancellationPolicy> findByPolicyTypeAndStatusOrderByPriorityDesc(
            CancellationPolicy.PolicyType policyType, 
            CancellationPolicy.PolicyStatus status
    );

    // Find policies for specific category
    List<CancellationPolicy> findByCategoryAndStatusOrderByPriorityDesc(
            Category category, 
            CancellationPolicy.PolicyStatus status
    );

    // Find default policies (no category restriction)
    List<CancellationPolicy> findByCategoryIsNullAndStatusOrderByPriorityDesc(
            CancellationPolicy.PolicyStatus status
    );

    // Find the most suitable policy for a booking
    @Query("""
        SELECT cp FROM CancellationPolicy cp 
        WHERE cp.status = :status 
        AND (cp.category = :category OR cp.category IS NULL)
        ORDER BY cp.category DESC NULLS LAST, cp.priority DESC
        """)
    List<CancellationPolicy> findApplicablePolicies(
            @Param("status") CancellationPolicy.PolicyStatus status,
            @Param("category") Category category
    );

    // Get the best matching policy (highest priority, category-specific preferred)
    @Query("""
        SELECT cp FROM CancellationPolicy cp 
        WHERE cp.status = :status 
        AND (cp.category = :category OR cp.category IS NULL)
        ORDER BY cp.category DESC NULLS LAST, cp.priority DESC
        LIMIT 1
        """)
    Optional<CancellationPolicy> findBestMatchingPolicy(
            @Param("status") CancellationPolicy.PolicyStatus status,
            @Param("category") Category category
    );

    // Admin queries
    Page<CancellationPolicy> findByStatusOrderByPriorityDesc(
            CancellationPolicy.PolicyStatus status, 
            Pageable pageable
    );

    Page<CancellationPolicy> findByPolicyTypeOrderByPriorityDesc(
            CancellationPolicy.PolicyType policyType, 
            Pageable pageable
    );

    // Search policies by name
    @Query("""
        SELECT cp FROM CancellationPolicy cp 
        WHERE LOWER(cp.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(cp.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        ORDER BY cp.priority DESC
        """)
    Page<CancellationPolicy> searchPolicies(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Check if policy name exists (for uniqueness)
    boolean existsByNameAndIdNot(String name, Long id);
    boolean existsByName(String name);

    // Statistics
    @Query("SELECT COUNT(cp) FROM CancellationPolicy cp WHERE cp.status = :status")
    long countByStatus(@Param("status") CancellationPolicy.PolicyStatus status);

    @Query("SELECT cp.policyType, COUNT(cp) FROM CancellationPolicy cp WHERE cp.status = :status GROUP BY cp.policyType")
    List<Object[]> countByPolicyTypeAndStatus(@Param("status") CancellationPolicy.PolicyStatus status);
}
