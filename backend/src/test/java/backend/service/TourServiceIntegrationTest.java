package backend.service;

import backend.entity.Category;
import backend.entity.Tour;
import backend.repository.CategoryRepository;
import backend.repository.TourRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test cho Tour Service
 * Test các chức năng chính của Tour Service với database thực
 */
@DataJpaTest
@ActiveProfiles("test")
@Import(backend.service.impl.TourServiceImpl.class)
@DisplayName("Tour Service Integration Tests")
class TourServiceIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TourService tourService;

    private Category testCategory;
    private Tour testTour;

    @BeforeEach
    void setUp() {
        // Tạo category test
        testCategory = new Category();
        testCategory.setName("Test Category");
        testCategory.setSlug("test-category");
        testCategory.setStatus(Category.CategoryStatus.ACTIVE);
        testCategory = entityManager.persistAndFlush(testCategory);

        // Tạo tour test
        testTour = new Tour();
        testTour.setName("Test Tour");
        testTour.setSlug("test-tour");
        testTour.setDescription("Test tour description");
        testTour.setPrice(new BigDecimal("5000000"));
        testTour.setSalePrice(new BigDecimal("4500000"));
        testTour.setDuration(3);
        testTour.setMaxPeople(20);
        testTour.setCategory(testCategory);
        testTour.setStatus(Tour.TourStatus.ACTIVE);
        testTour = entityManager.persistAndFlush(testTour);
    }

    @Test
    @DisplayName("TC052: Tìm tour theo ID thành công")
    void testGetTourById_Success() {
        // When
        Optional<Tour> result = tourService.getTourById(testTour.getId());

        // Then
        assertTrue(result.isPresent());
        assertEquals(testTour.getName(), result.get().getName());
        assertEquals(testTour.getPrice(), result.get().getPrice());
    }

    @Test
    @DisplayName("TC053: Tìm tour theo ID không tồn tại")
    void testGetTourById_NotFound() {
        // When
        Optional<Tour> result = tourService.getTourById(999L);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("TC054: Tìm kiếm tour theo từ khóa")
    void testSearchTours_ByKeyword() {
        // Given
        PageRequest pageable = PageRequest.of(0, 10);

        // When
        Page<Tour> result = tourService.searchToursWithFilters(
                "Test", null, null, null, null, null, null, null, null, null, null, null, null, pageable
        );

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() > 0);
        assertEquals("Test Tour", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("TC055: Tìm kiếm tour với bộ lọc giá")
    void testSearchTours_WithPriceFilter() {
        // Given
        PageRequest pageable = PageRequest.of(0, 10);

        // When
        Page<Tour> result = tourService.searchToursWithFilters(
                null, null, 
                new BigDecimal("3000000"), 
                new BigDecimal("6000000"), 
                null, null, null, null, null, null, null, null, null, pageable
        );

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() > 0);
        assertTrue(result.getContent().get(0).getPrice().compareTo(new BigDecimal("3000000")) >= 0);
        assertTrue(result.getContent().get(0).getPrice().compareTo(new BigDecimal("6000000")) <= 0);
    }

    @Test
    @DisplayName("TC056: Lấy danh sách tour đang hoạt động")
    void testGetAllActiveTours() {
        // When
        var result = tourService.getAllActiveTours();

        // Then
        assertNotNull(result);
        assertTrue(result.size() > 0);
        assertTrue(result.stream().allMatch(t -> t.getStatus() == Tour.TourStatus.ACTIVE));
    }

    @Test
    @DisplayName("TC057: Lấy danh sách tour nổi bật")
    void testGetFeaturedTours() {
        // Given - Tạo tour nổi bật
        Tour featuredTour = new Tour();
        featuredTour.setName("Featured Tour");
        featuredTour.setSlug("featured-tour");
        featuredTour.setDescription("Featured tour description");
        featuredTour.setPrice(new BigDecimal("6000000"));
        featuredTour.setDuration(4);
        featuredTour.setMaxPeople(25);
        featuredTour.setCategory(testCategory);
        featuredTour.setStatus(Tour.TourStatus.ACTIVE);
        featuredTour.setIsFeatured(true);
        entityManager.persistAndFlush(featuredTour);

        // When
        var result = tourService.getFeaturedTours();

        // Then
        assertNotNull(result);
        assertTrue(result.size() > 0);
        assertTrue(result.stream().allMatch(Tour::getIsFeatured));
    }

    @Test
    @DisplayName("TC058: Lấy tour theo category")
    void testGetToursByCategory() {
        // When
        var result = tourService.getToursByCategory(testCategory.getId());

        // Then
        assertNotNull(result);
        assertTrue(result.size() > 0);
        assertTrue(result.stream().allMatch(t -> t.getCategory().getId().equals(testCategory.getId())));
    }

    @Test
    @DisplayName("TC059: Kiểm tra slug đã tồn tại")
    void testSlugExists_True() {
        // When
        boolean exists = tourService.slugExists("test-tour");

        // Then
        assertTrue(exists);
    }

    @Test
    @DisplayName("TC060: Kiểm tra slug chưa tồn tại")
    void testSlugExists_False() {
        // When
        boolean exists = tourService.slugExists("non-existent-slug");

        // Then
        assertFalse(exists);
    }
}
