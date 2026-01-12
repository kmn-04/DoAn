package backend.service;

import java.util.List;

/**
 * Service interface for OpenAI API integration
 */
public interface OpenAIService {
    
    /**
     * Generate text content using OpenAI API
     * 
     * @param prompt The prompt to send to OpenAI
     * @param maxTokens Maximum number of tokens to generate (optional, uses default if null)
     * @param temperature Temperature for randomness (0.0 to 2.0, optional, uses default if null)
     * @return Generated text content
     * @throws Exception if API call fails
     */
    String generateText(String prompt, Integer maxTokens, Double temperature) throws Exception;
    
    /**
     * Generate text content with default settings
     * 
     * @param prompt The prompt to send to OpenAI
     * @return Generated text content
     * @throws Exception if API call fails
     */
    String generateText(String prompt) throws Exception;
    
    /**
     * Generate multiple text completions
     * 
     * @param prompt The prompt to send to OpenAI
     * @param n Number of completions to generate
     * @param maxTokens Maximum number of tokens per completion
     * @return List of generated text contents
     * @throws Exception if API call fails
     */
    List<String> generateMultipleTexts(String prompt, int n, Integer maxTokens) throws Exception;
    
    /**
     * Check if OpenAI API is configured and available
     * 
     * @return true if API key is configured, false otherwise
     */
    boolean isConfigured();
}
