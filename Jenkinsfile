pipeline {
    agent any

    parameters {
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run unit tests')
        booleanParam(name: 'RUN_SONARQUBE', defaultValue: true, description: 'Run SonarQube code quality analysis')
    }

    environment {
        SONARQUBE_SERVER = 'http://192.168.18.80:9000'
        SONAR_TOKEN = credentials('sonar-token') // Jenkins credential ID for SonarQube token
        IMAGE_NAME = 'selecao' // Docker image name
        CONTAINER_NAME = 'selecao-container' // Docker container name
        EXPOSED_PORT = '8083' // Host port to expose the site
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/maulanaakbrr/Selecao.git', credentialsId: 'github-access'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { params.RUN_SONARQUBE }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "sonar-scanner \
                        -Dsonar.projectKey=selecao-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONARQUBE_SERVER \
                        -Dsonar.login=$SONAR_TOKEN"
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS }
            }
            steps {
                sh 'chmod +x node_modules/.bin/jest || true'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    sh "docker run -d -p ${EXPOSED_PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully, and Docker container is running!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
