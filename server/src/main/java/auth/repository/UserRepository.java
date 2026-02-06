package auth.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import auth.entity.User;

import java.util.Optional;

import java.lang.StackWalker.Option;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String token);
    
}
