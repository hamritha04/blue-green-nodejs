pipeline {

    agent any

    environment {
        DOCKER_IMAGE = "hamritha04/blue-green-nodejs"
        DOCKER_CREDENTIALS = "dockerhub-credentials"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% ."
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat "docker push %DOCKER_IMAGE%:%BUILD_NUMBER%"
            }
        }

        stage('Deploy Green') {
            steps {
                bat '''
                docker rm -f green-app 2>NUL || exit 0
                docker run -d --name green-app -p 8083:3000 -e VERSION=%BUILD_NUMBER% %DOCKER_IMAGE%:%BUILD_NUMBER%
                '''
            }
        }

        stage('Health Check Green') {
            steps {
                bat '''
                powershell -Command "Start-Sleep -Seconds 5"
                curl --fail http://localhost:8083/health
                '''
            }
        }

        stage('Switch Traffic to Green') {
            steps {
                    bat '''
                    powershell -Command "(Get-Content nginx/nginx.conf) -replace 'server host.docker.internal:8082;', 'server host.docker.internal:8083;' | Set-Content nginx/nginx.conf"

                    docker exec blue-green-proxy nginx -s reload

                    docker exec blue-green-proxy cat /etc/nginx/nginx.conf

                    curl --fail http://localhost:8080/health
                    '''
            }
        }
        
    }

    post {
        success {
            echo 'Blue-Green deployment completed successfully.'
        }

        failure {
            echo 'Deployment failed. Blue environment remains available for rollback.'
        }
    }
}