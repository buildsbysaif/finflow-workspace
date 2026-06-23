# ==========================================
# STAGE 1: MAVEN COMPILE ENVIRONMENT
# ==========================================
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /build

#Copy the Maven wrapper files first to utilize Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Give the Linux script execute permissions 
RUN chmod +x ./mvnw

# Download all Maven dependencies offline 
RUN ./mvnw dependency:go-offline

# Copy the actual Java source code
COPY src ./src

# Compile the application into a standalone Jar, explicitly skipping unit tests 
RUN ./mvnw clean package -DskipTests


# ==========================================
# STAGE 2: LEAN PRODUCTION RUNTIME
# ==========================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy ONLY the compiled .jar file from the 'builder' container above
COPY --from=builder /build/target/*.jar app.jar

# Document that this container routes traffic on port 8080
EXPOSE 8080

# Force Spring Boot to activate the 'docker' configuration profile
ENV SPRING_PROFILES_ACTIVE=docker

ENTRYPOINT ["java", "-jar", "app.jar"]