pipeline {
    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t expense-app .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop expense-app || true
                docker rm expense-app || true
                docker run -d -p 3000:3000 --name expense-app expense-app
                '''
            }
        }
    }
}