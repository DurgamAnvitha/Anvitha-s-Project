# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
COPY . .
RUN mvn clean install -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-jammy
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]