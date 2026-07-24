pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:v1.23.2-debug
    tty: true
    command:
      - /busybox/cat
    volumeMounts:
      - name: docker-config
        mountPath: /kaniko/.docker

  volumes:
  - name: docker-config
    secret:
      secretName: dockerhub-secret
'''
        }
    }

    environment {
        REGISTRY = "docker.io"
        DOCKER_USER = "chandanbharadwaj007"

        BACKEND_IMAGE = "docker.io/chandanbharadwaj007/opssphere-backend"
        FRONTEND_IMAGE = "docker.io/chandanbharadwaj007/opssphere-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                container('kaniko') {
                    sh '''
                    /kaniko/executor \
                      --context=$WORKSPACE/backend \
                      --dockerfile=$WORKSPACE/backend/Dockerfile \
                      --destination=$BACKEND_IMAGE:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                container('kaniko') {
                    sh '''
                    /kaniko/executor \
                      --context=$WORKSPACE/frontend \
                      --dockerfile=$WORKSPACE/frontend/Dockerfile \
                      --destination=$FRONTEND_IMAGE:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Done') {
            steps {
                echo "Images Built Successfully"
            }
        }
    }
}