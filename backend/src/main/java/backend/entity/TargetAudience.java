package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "target_audiences")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class TargetAudience {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    // Many-to-Many relationship with Tour
    @ManyToMany(mappedBy = "targetAudiences", fetch = FetchType.LAZY)
    private Set<Tour> tours;
    
    public TargetAudience(String name) {
        this.name = name;
    }
}
