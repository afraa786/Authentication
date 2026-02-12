# Stage 1: build
FROM maven:3.9.1-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: runtime
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar spring-boot-docker.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "spring-boot-docker.jar"]
