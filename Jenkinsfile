pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vishaltomar9119/Simple-Expanse-Tracker-API.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t expense-app .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh 'docker stop expense-app || true'
                sh 'docker rm expense-app || true'
            }
        }

        stage('Run Container') {
            steps {
                sh 'docker run -d -p 3000:3000 --name expense-app expense-app'
            }
        }
    }
}