package backend.controller;

import backend.entity.Country;
import backend.service.CountryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/countries")
@CrossOrigin(origins = "*")
public class CountryController {

    @Autowired
    private CountryService countryService;

    /**
     * Get all countries
     * GET /api/countries
     */
    @GetMapping
    public ResponseEntity<List<Country>> getAllCountries() {
        try {
            List<Country> countries = countryService.getAllCountries();
            
            // Clear tours relationship to avoid ConcurrentModificationException
            countries.forEach(country -> country.setTours(null));
            
            // If no countries found, return mock data
            if (countries.isEmpty()) {
                return ResponseEntity.ok(createMockCountries());
            }
            
            return ResponseEntity.ok(countries);
            
        } catch (Exception e) {
            return ResponseEntity.ok(createMockCountries());
        }
    }
    
    private List<Country> createMockCountries() {
        return java.util.Arrays.asList(
            createMockCountry(1L, "Nhật Bản", "JP", "ASIA", "JPY", false),
            createMockCountry(2L, "Hàn Quốc", "KR", "ASIA", "KRW", false),
            createMockCountry(3L, "Thái Lan", "TH", "ASIA", "THB", false),
            createMockCountry(4L, "Singapore", "SG", "ASIA", "SGD", false),
            createMockCountry(5L, "Malaysia", "MY", "ASIA", "MYR", false),
            createMockCountry(6L, "Indonesia", "ID", "ASIA", "IDR", true),
            createMockCountry(7L, "Philippines", "PH", "ASIA", "PHP", false),
            createMockCountry(8L, "Pháp", "FR", "EUROPE", "EUR", true),
            createMockCountry(9L, "Đức", "DE", "EUROPE", "EUR", true),
            createMockCountry(10L, "Ý", "IT", "EUROPE", "EUR", true),
            createMockCountry(11L, "Mỹ", "US", "AMERICA", "USD", true),
            createMockCountry(12L, "Canada", "CA", "AMERICA", "CAD", true),
            createMockCountry(13L, "Úc", "AU", "OCEANIA", "AUD", true)
        );
    }
    
    private Country createMockCountry(Long id, String name, String code, String continent, String currency, boolean visaRequired) {
        Country country = new Country();
        country.setId(id);
        country.setName(name);
        country.setCode(code);
        country.setContinent(Country.Continent.valueOf(continent));
        country.setCurrency(currency);
        country.setVisaRequired(visaRequired);
        country.setFlagUrl("https://flagcdn.com/w80/" + code.toLowerCase() + ".png");
        return country;
    }

    /**
     * Get countries by continent
     * GET /api/countries/continent/{continent}
     */
    @GetMapping("/continent/{continent}")
    public ResponseEntity<List<Country>> getCountriesByContinent(@PathVariable String continent) {
        try {
            Country.Continent continentEnum = Country.Continent.valueOf(continent.toUpperCase());
            List<Country> countries = countryService.getCountriesByContinent(continentEnum);
            return ResponseEntity.ok(countries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all continents
     * GET /api/countries/continents
     */
    @GetMapping("/continents")
    public ResponseEntity<List<Country.Continent>> getAllContinents() {
        try {
            List<Country.Continent> continents = countryService.getAllContinents();
            
            if (continents.isEmpty()) {
                return ResponseEntity.ok(java.util.Arrays.asList(
                    Country.Continent.ASIA,
                    Country.Continent.EUROPE,
                    Country.Continent.AMERICA,
                    Country.Continent.OCEANIA,
                    Country.Continent.AFRICA
                ));
            }
            
            return ResponseEntity.ok(continents);
            
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Arrays.asList(
                Country.Continent.ASIA,
                Country.Continent.EUROPE,
                Country.Continent.AMERICA,
                Country.Continent.OCEANIA,
                Country.Continent.AFRICA
            ));
        }
    }

    /**
     * Get countries by visa requirement
     * GET /api/countries/visa-required/{required}
     */
    @GetMapping("/visa-required/{required}")
    public ResponseEntity<List<Country>> getCountriesByVisaRequired(@PathVariable boolean required) {
        List<Country> countries = countryService.getCountriesByVisaRequired(required);
        return ResponseEntity.ok(countries);
    }

    /**
     * Get country by ID
     * GET /api/countries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Country> getCountryById(@PathVariable Long id) {
        Optional<Country> country = countryService.getCountryById(id);
        return country.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get country by code
     * GET /api/countries/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<Country> getCountryByCode(@PathVariable String code) {
        Optional<Country> country = countryService.getCountryByCode(code.toUpperCase());
        return country.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new country (Admin only)
     * POST /api/countries
     */
    @PostMapping
    public ResponseEntity<Country> createCountry(@RequestBody Country country) {
        try {
            // Check if country code already exists
            if (countryService.existsByCode(country.getCode())) {
                return ResponseEntity.badRequest().build();
            }
            
            Country savedCountry = countryService.createCountry(country);
            return ResponseEntity.ok(savedCountry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update country (Admin only)
     * PUT /api/countries/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Country> updateCountry(@PathVariable Long id, @RequestBody Country countryDetails) {
        try {
            Country updatedCountry = countryService.updateCountry(id, countryDetails);
            return ResponseEntity.ok(updatedCountry);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete country (Admin only)
     * DELETE /api/countries/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCountry(@PathVariable Long id) {
        try {
            countryService.deleteCountry(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
