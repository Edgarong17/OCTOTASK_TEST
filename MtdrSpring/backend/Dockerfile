# syntax=docker/dockerfile:1.7

# 1. Etapa de compilación (Usa la imagen de Docker Hub con login exitoso)
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw

COPY src/ src/

RUN ./mvnw -B -DskipTests clean package spring-boot:repackage

# 2. Etapa de ejecución (Limpia y sin comentarios en la misma línea)
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

RUN useradd --system --uid 10001 appuser \
    && mkdir -p /mtdrworkshop/creds \
    && chown -R appuser /app /mtdrworkshop

# Usamos el comodín para evitar errores por cambios de versión de Maven
COPY --from=builder /workspace/target/*.jar /app/MyTodoList.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/MyTodoList.jar"]