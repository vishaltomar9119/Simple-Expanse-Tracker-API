pipeline {
    agent any

    environment {
        IMAGE_NAME = "expense-app"
        CONTAINER_NAME = "expense-app-container"
        PORT = "3000"
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/vishaltomar9119/Simple-Expanse-Tracker-API.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Stop Old Container') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
            }
        }

        stage('Run Container') {
            steps {
                sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${IMAGE_NAME}"
            }
        }
    }
}