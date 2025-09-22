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
        List<Country> countries = countryService.getAllCountries();
        return ResponseEntity.ok(countries);
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
        List<Country.Continent> continents = countryService.getAllContinents();
        return ResponseEntity.ok(continents);
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
