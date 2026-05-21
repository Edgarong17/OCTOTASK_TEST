# syntax=docker/dockerfile:1.7

#FROM public.ecr.aws/amazoncorretto/amazoncorretto:17 AS builder
FROM eclipse-temurin:17-jdk-jammy AS builder # Usar si el limit rate de Oracle no es un porblema

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN sed -i 's/\r$//' mvnw

RUN chmod +x mvnw

COPY src/ src/

RUN ./mvnw -B -DskipTests clean package spring-boot:repackage

#FROM ghcr.io/graalvm/jdk-community:17
FROM eclipse-temurin:17-jre-jammy # Usar si el limit rate de Oracle no es un porblema

WORKDIR /app

#RUN adduser --system --uid 10001 appuser \
#    && mkdir -p /mtdrworkshop/creds \
#    && chown -R appuser /app /mtdrworkshop

RUN useradd --system --uid 10001 appuser \
    && mkdir -p /mtdrworkshop/creds \
    && chown -R appuser /app /mtdrworkshop

COPY --from=builder /workspace/target/MyTodoList-0.0.1-SNAPSHOT.jar /app/MyTodoList.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/MyTodoList.jar"]
