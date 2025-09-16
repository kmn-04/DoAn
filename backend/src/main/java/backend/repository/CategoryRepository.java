package backend.repository;

import backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Removed slug-related methods
    
    // Tìm tất cả categories đang active, sắp xếp theo display_order
    List<Category> findByIsActiveTrueOrderByDisplayOrder();
    
    // Tìm tất cả categories sắp xếp theo display_order
    List<Category> findAllByOrderByDisplayOrder();
    
    // Tìm theo trạng thái active
    List<Category> findByIsActive(Boolean isActive);
    
    // Tìm theo tên (tìm kiếm không phân biệt hoa thường)
    List<Category> findByNameContainingIgnoreCase(String name);
    
    // Lấy display_order lớn nhất hiện tại
    @Query("SELECT MAX(c.displayOrder) FROM Category c")
    Optional<Integer> findMaxDisplayOrder();
    
    // Cập nhật display_order cho category
    @Query("UPDATE Category c SET c.displayOrder = :displayOrder WHERE c.id = :id")
    void updateDisplayOrder(@Param("id") Long id, @Param("displayOrder") Integer displayOrder);
    
    // Tìm categories có display_order lớn hơn hoặc bằng
    @Query("SELECT c FROM Category c WHERE c.displayOrder >= :displayOrder ORDER BY c.displayOrder")
    List<Category> findByDisplayOrderGreaterThanEqual(@Param("displayOrder") Integer displayOrder);
    
    // Đếm số lượng categories đang active
    long countByIsActiveTrue();
    
    // Đếm số lượng categories theo trạng thái
    long countByIsActive(Boolean isActive);
}
