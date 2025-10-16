package backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${app.name:Tour Booking System}")
    private String appName;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(appName + " API Documentation")
                        .version("1.0.0")
                        .description("""
                                ## Tour Booking System REST API
                                
                                Comprehensive API documentation for the Tour Booking System.
                                
                                ### Features:
                                - **Authentication & Authorization**: JWT-based secure authentication
                                - **Tour Management**: Browse, search, and filter tours
                                - **Booking System**: Create and manage tour bookings
                                - **Review System**: User reviews and ratings
                                - **Admin Dashboard**: Statistics and management
                                - **Payment Integration**: VNPay payment gateway
                                
                                ### Authentication:
                                Most endpoints require JWT authentication. To authenticate:
                                1. Login via `/api/auth/login` to get JWT token
                                2. Click "Authorize" button and enter: `Bearer <your-token>`
                                3. All subsequent requests will include the token
                                
                                ### Error Handling:
                                All errors follow consistent format:
                                ```json
                                {
                                  "message": "Error description",
                                  "status": "ERROR",
                                  "data": null
                                }
                                ```
                                """)
                        .contact(new Contact()
                                .name("Tour Booking System Team")
                                .email("support@tourbooking.com")
                                .url("https://tourbooking.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server()
                                .url(appUrl)
                                .description("Development Server"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Server")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")
                                .description("Enter JWT token with 'Bearer ' prefix")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}

