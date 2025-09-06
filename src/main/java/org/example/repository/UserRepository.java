// /Users/sauravkejriwal/workspace/vimadimension/src/main/java/org/example/repository/UserRepository.java
package org.example.repository;

import org.example.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Organization-based queries - using correct JPA property path
    List<User> findByOrganization_Id(Long organizationId);
    long countByOrganization_Id(Long organizationId);
}