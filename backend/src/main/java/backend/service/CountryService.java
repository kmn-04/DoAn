package backend.service;

import backend.entity.Country;
import backend.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CountryService {

    @Autowired
    private CountryRepository countryRepository;

    /**
     * Get all countries
     */
    public List<Country> getAllCountries() {
        return countryRepository.findAllOrderByName();
    }

    /**
     * Get countries by continent
     */
    public List<Country> getCountriesByContinent(Country.Continent continent) {
        return countryRepository.findByContinent(continent);
    }

    /**
     * Get all continents
     */
    public List<Country.Continent> getAllContinents() {
        return countryRepository.findAllContinents();
    }

    /**
     * Get countries by visa requirement
     */
    public List<Country> getCountriesByVisaRequired(Boolean visaRequired) {
        return countryRepository.findByVisaRequired(visaRequired);
    }

    /**
     * Get country by ID
     */
    public Optional<Country> getCountryById(Long id) {
        return countryRepository.findById(id);
    }

    /**
     * Get country by code
     */
    public Optional<Country> getCountryByCode(String code) {
        return countryRepository.findByCode(code);
    }

    /**
     * Check if country exists by code
     */
    public boolean existsByCode(String code) {
        return countryRepository.existsByCode(code);
    }

    /**
     * Create new country
     */
    public Country createCountry(Country country) {
        return countryRepository.save(country);
    }

    /**
     * Update country
     */
    public Country updateCountry(Long id, Country countryDetails) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + id));

        country.setName(countryDetails.getName());
        country.setCode(countryDetails.getCode());
        country.setContinent(countryDetails.getContinent());
        country.setCurrency(countryDetails.getCurrency());
        country.setVisaRequired(countryDetails.getVisaRequired());
        country.setFlagUrl(countryDetails.getFlagUrl());

        return countryRepository.save(country);
    }

    /**
     * Delete country
     */
    public void deleteCountry(Long id) {
        if (!countryRepository.existsById(id)) {
            throw new RuntimeException("Country not found with id: " + id);
        }
        countryRepository.deleteById(id);
    }
}
