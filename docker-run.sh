#!/bin/bash

docker stop rmu-api-spells

docker rm rmu-api-spells

docker rmi labcabrera/rmu-api-spells:latest

docker build -t labcabrera/rmu-api-spells:latest .

docker run -d -p 3009:3009 --network rmu-network --name rmu-api-spells -h rmu-api-spells \
    -e PORT='3009' \
    -e RMU_MONGO_CORE_URI='mongodb://admin:admin@rmu-mongo:27017/rmu-spells?authSource=admin' \
    -e RMU_IAM_BASE_URL='http://rmu-keycloak:8080' \
    -e RMU_IAM_JWK_URI=http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/certs \
    -e RMU_IAM_TOKEN_URI=http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/token \
    -e RMU_IAM_REALM='rmu-local' \
    -e RMU_IAM_CLIENT_ID='rmu-client' \
    -e RMU_IAM_CLIENT_SECRET='1tUzPc24SYJMPpX37g2eymEoS9C3Ttzw' \
    -e RMU_KAFKA_CLIENT_ID='rmu-api-spells' \
    -e RMU_KAFKA_BROKERS='rmu-kafka-broker:9092' \
    -e RMU_KAFKA_PARTITION_COUNT='1' \
    labcabrera/rmu-api-spells:latest

docker logs -f rmu-api-spells
