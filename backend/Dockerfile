# Multi-stage build so the final image doesn't carry the JDK/Maven toolchain.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Dependencies first so they cache across builds that only change source.
COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./
RUN ./mvnw -q -B dependency:go-offline

COPY src ./src
RUN ./mvnw -q -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render (and most PaaS Docker runners) inject PORT at runtime; the app
# listens on it via server.port=${PORT:8080} in application.properties.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
