package com.spring.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.spring.security.jwt.JwtFilter;

@Configuration
public class SecurityConfig {

	@Autowired
	private JwtFilter jwtFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth.requestMatchers("/auth/**").permitAll()

						// ✅ PUBLIC — no login needed
						.requestMatchers(HttpMethod.GET, "/products/**").permitAll()

						// ✅ PUBLIC — AI APIs (FREE access)
						.requestMatchers("/ai/**").permitAll()

						// ✅ PUBLIC — Payment config
						.requestMatchers("/payment/config").permitAll()

						// 🔒 ADMIN only
						.requestMatchers("/admin/**").hasRole("ADMIN")
						// 🔒 USER actions (login required)
						.requestMatchers("/cart/**").authenticated().requestMatchers("/orders/**").authenticated()
						.requestMatchers("/users/**").authenticated()

						// 🔒 PROTECTED — login required for everything else
						.anyRequest().authenticated());
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(
				// ========== Local Development ==========
				"http://localhost:5173", 
				"http://localhost:5174", 
				"http://localhost:5175",
				
				// ========== Production - Vercel ==========
				// Main production domains
				"https://e-commerce-project-frontend-theta.vercel.app",
				"https://e-commerce-project-frontend-4srjqhnw.vercel.app",
				
				// Preview domains (for different branches/commits)
				"https://e-commerce-project-fron-git-26b2a5-annabirajadar-1210s-projects.vercel.app",
				"https://e-commerce-project-frontend-oqy9do32v.vercel.app",
				
				// Wildcard for all Vercel preview deployments
				"https://*.vercel.app"
		));

		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L); // Cache preflight for 1 hour

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

}
