package backend.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for HTTP response compression.
 * Enables GZIP compression for JSON and text responses.
 */
@Configuration
public class CompressionConfig {
    
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> compressionCustomizer() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                connector.setProperty("compression", "on");
                // Minimum response size to compress (2KB)
                connector.setProperty("compressionMinSize", "2048");
                // MIME types to compress
                connector.setProperty("compressibleMimeType", 
                    "text/html," +
                    "text/xml," +
                    "text/plain," +
                    "text/css," +
                    "text/javascript," +
                    "application/javascript," +
                    "application/json," +
                    "application/xml");
            });
        };
    }
}

