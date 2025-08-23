package org.example.repository;

import org.example.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    Optional<Organization> findByName(String name);
    
    Optional<Organization> findByContactEmail(String contactEmail);
    
    boolean existsByName(String name);
    
    boolean existsByContactEmail(String contactEmail);
}