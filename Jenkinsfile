pipeline {
    agent {
        kubernetes {
            yaml '''
aapiVersion: v1
kind: Pod
spec:
  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.23.2-debug
      command:
        - /busybox/cat
      tty: true
      volumeMounts:
        - name: docker-config
          mountPath: /kaniko/.docker
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: git
      image: alpine/git:latest
      command:
        - cat
      tty: true
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

  volumes:
    - name: docker-config
      secret:
        secretName: dockerhub-secret
        items:
          - key: .dockerconfigjson
            path: config.json

    - name: workspace-volume
      emptyDir: {}
'''
        }
    }

    environment {
        BACKEND_IMAGE = 'docker.io/chandanbharadwaj007/opssphere-backend'
        FRONTEND_IMAGE = 'docker.io/chandanbharadwaj007/opssphere-frontend'

        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Verify Docker Config') {
            steps {
                container('kaniko') {
                    sh '''
            echo "=== Files ==="
            ls -la /kaniko/.docker

            echo ""
            echo "=== Config ==="
            cat /kaniko/.docker/config.json
            '''
                }
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

        stage('Update Helm Chart') {
            steps {
                container('git') {
                    sh '''
                    sed -i "s|repository: .*opssphere-backend|repository: chandanbharadwaj007/opssphere-backend|g" helm/opssphere/values.yaml
                    sed -i "/repository: chandanbharadwaj007\\/opssphere-backend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" helm/opssphere/values.yaml

                    sed -i "s|repository: .*opssphere-frontend|repository: chandanbharadwaj007/opssphere-frontend|g" helm/opssphere/values.yaml
                    sed -i "/repository: chandanbharadwaj007\\/opssphere-frontend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" helm/opssphere/values.yaml
                    '''
                }
            }
        }

        stage('Debug Git') {
            steps {
                container('git') {
                    sh '''
            echo "PWD"
            pwd

            echo
            echo "WORKSPACE=$WORKSPACE"

            echo
            ls -la

            echo
            ls -la $WORKSPACE

            echo
            ls -la $WORKSPACE/.git || true

            git -C $WORKSPACE status || true
            '''
                }
            }
        }
    }

    post {
        success {
            echo ''
            echo '===================================='
            echo ' Build Successful'
            echo " Backend : ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo " Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo ' ArgoCD will deploy automatically.'
            echo '===================================='
        }

        failure {
            echo 'Build Failed'
        }
    }
}
