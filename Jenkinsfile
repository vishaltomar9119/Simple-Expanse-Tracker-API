pipeline {
    agent any

    stages {
        
        stage('Build') {
            steps {
                echo 'Building project...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Run App') {
            steps {
                sh 'npm install'
                sh 'nohup npm start &'
            }
        }
    }
}