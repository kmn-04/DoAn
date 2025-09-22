package backend.repository;

import backend.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByCode(String code);

    List<Country> findByContinent(Country.Continent continent);

    @Query("SELECT c FROM Country c WHERE c.visaRequired = :visaRequired")
    List<Country> findByVisaRequired(@Param("visaRequired") Boolean visaRequired);

    @Query("SELECT c FROM Country c ORDER BY c.name ASC")
    List<Country> findAllOrderByName();

    @Query("SELECT DISTINCT c.continent FROM Country c ORDER BY c.continent")
    List<Country.Continent> findAllContinents();

    boolean existsByCode(String code);
}
