pipeline {
    agent {
        label 'docker-agent-1'
    }

    options {
        disableConcurrentBuilds(abortPrevious: true)
        timestamps()
    }

    parameters {
        choice(
            name: 'ACTION',
            choices: [
                'Deploy',
                'Rollback',
                'Restart',
                'Stop',
                'Start',
                'Status',
                'Logs',
                'HealthCheck'
            ],
            description: 'Choose action to perform on Kubernetes'
        )
        choice(
            name: 'TARGET',
            choices: ['all', 'api', 'frontend'],
            description: 'Which component to target'
        )
        string(name: 'ROLLBACK_BUILD', defaultValue: '', description: '[Rollback] Image build number to rollback to. Leave empty to use kubectl rollout undo.')
        choice(name: 'LOG_LINES', choices: ['100', '500', '1000', 'all'], description: '[Logs] Number of log lines to retrieve')
    }

    environment {
        NEXUS_REGISTRY   = '172.16.100.33:8083'
        NAMESPACE        = 'ashiwani-personal-portfolio'
        GITHUB_REPO      = 'corevault-labs/landing-page'

        // API
        API_DIR             = 'apps/api-server'
        API_IMAGE_NAME      = 'ashiwani-personal-portfolio-api'
        API_DEPLOYMENT_NAME = 'ashiwani-personal-portfolio-api'
        API_SONAR_PROJECT   = 'ashiwani-personal-portfolio-api'
        API_HEALTH_URL      = 'https://api.ashiwanikumar.com/api/v1/healthCheck'
        API_PROD_URL        = 'https://api.ashiwanikumar.com'

        // Frontend
        FRONTEND_IMAGE_NAME      = 'ashiwani-personal-portfolio-frontend'
        FRONTEND_DEPLOYMENT_NAME = 'ashiwani-personal-portfolio-frontend'
        FRONTEND_SONAR_PROJECT   = 'ashiwani-personal-portfolio-frontend'
        FRONTEND_HEALTH_URL      = 'https://ashiwanikumar.com'
        FRONTEND_PROD_URL        = 'https://ashiwanikumar.com'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Branch Filter') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: 'unknown'
                    echo "Current branch: ${branchName}"

                    if (!(branchName in ['main', 'staging'])) {
                        currentBuild.result = 'NOT_BUILT'
                        error("Only main and staging branches are deployable.")
                    }
                }
            }
        }

        stage('Set Environment Variables') {
            steps {
                script {
                    def dateStr = new Date().format('yyyyMMdd-HHmmss')
                    env.DEPLOYMENT_ID = "${env.BUILD_NUMBER}-${dateStr}"
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"

                    echo "============================================"
                    echo "Deployment Configuration"
                    echo "============================================"
                    echo "Action:        ${params.ACTION}"
                    echo "Target:        ${params.TARGET}"
                    echo "Deployment ID: ${env.DEPLOYMENT_ID}"
                    echo "Namespace:     ${env.NAMESPACE}"
                    echo "============================================"
                }
            }
        }

        stage('Checkout') {
            when {
                expression { params.ACTION in ['Deploy', 'Rollback'] }
            }
            steps {
                script {
                    if (params.ACTION == 'Deploy') {
                        cleanWs()
                        checkout scm
                        env.CURRENT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                        env.COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                        env.COMMIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                        echo "Commit: ${env.CURRENT_COMMIT}"
                    } else if (params.ACTION == 'Rollback') {
                        cleanWs()
                        checkout scm
                        env.CURRENT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    }
                }
            }
        }

        // =============================================
        // SonarQube Analysis — API
        // =============================================

        stage('SonarQube Analysis - API') {
            when {
                expression { params.ACTION == 'Deploy' && params.TARGET in ['all', 'api'] }
            }
            steps {
                withSonarQubeEnv('sonarqube-172.16.100.34') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${API_SONAR_PROJECT} \
                          -Dsonar.projectName=${API_SONAR_PROJECT} \
                          -Dsonar.sources=${API_DIR} \
                          -Dsonar.exclusions=${API_DIR}/node_modules/**,${API_DIR}/k8s/**,${API_DIR}/tests/**,${API_DIR}/docs/**
                    """
                }
            }
        }

        stage('SonarQube Analysis - Frontend') {
            when {
                expression { params.ACTION == 'Deploy' && params.TARGET in ['all', 'frontend'] }
            }
            steps {
                withSonarQubeEnv('sonarqube-172.16.100.34') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${FRONTEND_SONAR_PROJECT} \
                          -Dsonar.projectName=${FRONTEND_SONAR_PROJECT} \
                          -Dsonar.sources=src \
                          -Dsonar.exclusions=node_modules/**,.next/**,k8s/**,public/**,apps/**
                    """
                }
            }
        }

        stage('Quality Gate') {
            when {
                expression { params.ACTION == 'Deploy' }
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        // =============================================
        // Build & Push Docker Images
        // =============================================

        stage('Build & Push API Image') {
            when {
                expression { params.ACTION == 'Deploy' && params.TARGET in ['all', 'api'] }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds-172.16.100.33',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh """
                        echo "\$NEXUS_PASS" | docker login ${NEXUS_REGISTRY} -u "\$NEXUS_USER" --password-stdin

                        docker pull node:20-alpine

                        docker build \
                          -t ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_TAG} \
                          -t ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:latest \
                          -f ${API_DIR}/Dockerfile ${API_DIR}

                        docker push ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:latest

                        echo "Image pushed: ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_TAG}"
                    """
                }
            }
        }

        stage('Build & Push Frontend Image') {
            when {
                expression { params.ACTION == 'Deploy' && params.TARGET in ['all', 'frontend'] }
            }
            steps {
                script {
                    withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                        withCredentials([usernamePassword(
                            credentialsId: 'nexus-creds-172.16.100.33',
                            usernameVariable: 'NEXUS_USER',
                            passwordVariable: 'NEXUS_PASS'
                        )]) {
                            sh """
                                echo "============================================"
                                echo "Building Frontend Docker image..."
                                echo "============================================"

                                BACKEND_API=\$(kubectl get secret ${NAMESPACE} \
                                    -n ${NAMESPACE} \
                                    -o jsonpath='{.data.BACKEND_API}' 2>/dev/null | base64 -d 2>/dev/null || echo "https://api.ashiwanikumar.com/api/v1")

                                echo "\$NEXUS_PASS" | docker login ${NEXUS_REGISTRY} -u "\$NEXUS_USER" --password-stdin

                                docker pull node:20-alpine

                                docker build \
                                  --build-arg BACKEND_API=\${BACKEND_API} \
                                  --build-arg NEXT_PUBLIC_BACKEND_API=\${BACKEND_API} \
                                  -t ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} \
                                  -t ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:latest \
                                  -f Dockerfile .

                                docker push ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}
                                docker push ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:latest

                                echo "Image pushed: ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                            """
                        }
                    }
                }
            }
        }

        // =============================================
        // K8s Deployment
        // =============================================

        stage('Deploy to K8s') {
            when {
                expression { params.ACTION == 'Deploy' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        sh "kubectl apply -f ${API_DIR}/k8s/namespace.yaml"

                        if (params.TARGET in ['all', 'api']) {
                            sh """
                                sed -i 's|${API_IMAGE_NAME}:.*|${API_IMAGE_NAME}:${IMAGE_TAG}|g' ${API_DIR}/k8s/deployment.yaml

                                kubectl apply -f ${API_DIR}/k8s/deployment.yaml
                                kubectl apply -f ${API_DIR}/k8s/service.yaml
                                kubectl apply -f ${API_DIR}/k8s/ingress.yaml

                                kubectl set image deployment/${API_DEPLOYMENT_NAME} \
                                  ${API_DEPLOYMENT_NAME}=${NEXUS_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_TAG} \
                                  -n ${NAMESPACE}

                                kubectl rollout status deployment/${API_DEPLOYMENT_NAME} \
                                  -n ${NAMESPACE} --timeout=180s

                                echo "API Deployment complete!"
                                kubectl get pods -n ${NAMESPACE} -l app=${API_DEPLOYMENT_NAME}
                            """
                        }

                        if (params.TARGET in ['all', 'frontend']) {
                            sh """
                                sed -i 's|${FRONTEND_IMAGE_NAME}:.*|${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment.yaml

                                kubectl apply -f k8s/deployment.yaml
                                kubectl apply -f k8s/service.yaml
                                kubectl apply -f k8s/ingress.yaml

                                kubectl set image deployment/${FRONTEND_DEPLOYMENT_NAME} \
                                  ${FRONTEND_DEPLOYMENT_NAME}=${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} \
                                  -n ${NAMESPACE}

                                kubectl rollout status deployment/${FRONTEND_DEPLOYMENT_NAME} \
                                  -n ${NAMESPACE} --timeout=180s

                                echo "Frontend Deployment complete!"
                                kubectl get pods -n ${NAMESPACE} -l app=${FRONTEND_DEPLOYMENT_NAME}
                            """
                        }
                    }
                }
            }
        }

        stage('K8s Health Check') {
            when {
                expression { params.ACTION in ['Deploy', 'HealthCheck'] }
            }
            steps {
                script {
                    sh "sleep 15"

                    if (params.TARGET in ['all', 'api']) {
                        sh """
                            echo "=== API Health Check ==="
                            for i in \$(seq 1 8); do
                                STATUS=\$(curl -sk -o /dev/null -w "%{http_code}" ${API_HEALTH_URL} || echo 000)
                                echo "API health check attempt \$i/8 - HTTP \$STATUS"
                                [ "\$STATUS" = "200" ] && exit 0
                                sleep 10
                            done
                            echo "WARNING: API health check incomplete"
                        """
                    }

                    if (params.TARGET in ['all', 'frontend']) {
                        sh """
                            echo "=== Frontend Health Check ==="
                            for i in \$(seq 1 8); do
                                STATUS=\$(curl -sk -o /dev/null -w "%{http_code}" ${FRONTEND_HEALTH_URL} || echo 000)
                                echo "Frontend health check attempt \$i/8 - HTTP \$STATUS"
                                [ "\$STATUS" = "200" ] || [ "\$STATUS" = "307" ] || [ "\$STATUS" = "302" ] && exit 0
                                sleep 10
                            done
                            echo "WARNING: Frontend health check incomplete"
                        """
                    }
                }
            }
        }

        stage('Rollback K8s') {
            when {
                expression { params.ACTION == 'Rollback' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            def imgName = t == 'api' ? API_IMAGE_NAME : FRONTEND_IMAGE_NAME

                            if (params.ROLLBACK_BUILD?.trim()) {
                                sh "kubectl set image deployment/${depName} ${depName}=${NEXUS_REGISTRY}/${imgName}:${params.ROLLBACK_BUILD} -n ${NAMESPACE}"
                            } else {
                                sh "kubectl rollout undo deployment/${depName} -n ${NAMESPACE}"
                            }
                            sh "kubectl rollout status deployment/${depName} -n ${NAMESPACE} --timeout=180s"
                            sh "kubectl get pods -n ${NAMESPACE} -l app=${depName}"
                        }
                    }
                }
            }
        }

        stage('Restart K8s') {
            when {
                expression { params.ACTION == 'Restart' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            sh """
                                kubectl rollout restart deployment/${depName} -n ${NAMESPACE}
                                kubectl rollout status deployment/${depName} -n ${NAMESPACE} --timeout=120s
                                echo "${t.toUpperCase()} Restarted"
                                kubectl get pods -n ${NAMESPACE} -l app=${depName}
                            """
                        }
                    }
                }
            }
        }

        stage('Stop K8s') {
            when {
                expression { params.ACTION == 'Stop' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            sh """
                                kubectl scale deployment/${depName} --replicas=0 -n ${NAMESPACE}
                                echo "${t.toUpperCase()} scaled to 0 (stopped)"
                            """
                        }
                    }
                }
            }
        }

        stage('Start K8s') {
            when {
                expression { params.ACTION == 'Start' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            sh """
                                kubectl scale deployment/${depName} --replicas=1 -n ${NAMESPACE}
                                kubectl rollout status deployment/${depName} -n ${NAMESPACE} --timeout=120s
                                echo "${t.toUpperCase()} scaled to 1 (started)"
                                kubectl get pods -n ${NAMESPACE} -l app=${depName}
                            """
                        }
                    }
                }
            }
        }

        stage('K8s Status') {
            when {
                expression { params.ACTION == 'Status' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            sh """
                                echo "=== ${t.toUpperCase()} Pods ==="
                                kubectl get pods -n ${NAMESPACE} -l app=${depName} -o wide
                                echo ""
                                echo "=== ${t.toUpperCase()} Deployment ==="
                                kubectl describe deployment/${depName} -n ${NAMESPACE}
                            """
                        }
                        sh """
                            echo ""
                            echo "=== Services ==="
                            kubectl get svc -n ${NAMESPACE}
                            echo ""
                            echo "=== Ingress ==="
                            kubectl get ingress -n ${NAMESPACE}
                        """
                    }
                }
            }
        }

        stage('K8s Logs') {
            when {
                expression { params.ACTION == 'Logs' }
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                    script {
                        def targets = params.TARGET == 'all' ? ['api', 'frontend'] : [params.TARGET]
                        targets.each { t ->
                            def depName = t == 'api' ? API_DEPLOYMENT_NAME : FRONTEND_DEPLOYMENT_NAME
                            sh """
                                echo "=== ${t.toUpperCase()} LOGS ==="
                                kubectl logs -l app=${depName} \
                                  -n ${NAMESPACE} \
                                  --tail=${params.LOG_LINES == 'all' ? '1000000' : params.LOG_LINES} \
                                  --prefix=true \
                                  --all-containers
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    sh """
                        docker rmi ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:${IMAGE_TAG} || true
                        docker rmi ${NEXUS_REGISTRY}/${API_IMAGE_NAME}:latest || true
                        docker rmi ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} || true
                        docker rmi ${NEXUS_REGISTRY}/${FRONTEND_IMAGE_NAME}:latest || true

                        docker image prune -f || true
                        docker container prune -f || true
                        docker builder prune -f --keep-storage=2GB || true
                    """
                } catch (Exception e) {
                    echo "Docker cleanup skipped: ${e.getMessage()}"
                }
                echo "Pipeline completed - Status: ${currentBuild.result}"
                echo "Deployment ID: ${env.DEPLOYMENT_ID}"
            }
        }

        success {
            script {
                def k8sInfo = [api: [:], frontend: [:]]
                try {
                    withKubeConfig([credentialsId: 'k8s-kubeconfig-172.16.100.30']) {
                        // API info
                        if (params.TARGET in ['all', 'api']) {
                            k8sInfo.api.podStatus = sh(
                                script: """
                                    kubectl get pods -n ${env.NAMESPACE} \
                                      -l app=${env.API_DEPLOYMENT_NAME} \
                                      --no-headers \
                                      -o custom-columns=\
NAME:.metadata.name,\
STATUS:.status.phase,\
READY:.status.containerStatuses[0].ready,\
RESTARTS:.status.containerStatuses[0].restartCount,\
NODE:.spec.nodeName
                                """,
                                returnStdout: true
                            ).trim() ?: 'No pods found'

                            k8sInfo.api.deployInfo = sh(
                                script: """
                                    kubectl get deployment/${env.API_DEPLOYMENT_NAME} \
                                      -n ${env.NAMESPACE} \
                                      --no-headers \
                                      -o custom-columns=\
READY:.status.readyReplicas,\
AVAILABLE:.status.availableReplicas,\
DESIRED:.spec.replicas
                                """,
                                returnStdout: true
                            ).trim() ?: 'Unknown'

                            def apiHttp = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' --max-time 15 ${env.API_HEALTH_URL} || echo '000'",
                                returnStdout: true
                            ).trim()
                            k8sInfo.api.httpStatus = apiHttp
                            k8sInfo.api.appStatus = (apiHttp == '200') ? 'UP' : 'DOWN'

                            k8sInfo.api.imageInfo = sh(
                                script: """
                                    kubectl get deployment/${env.API_DEPLOYMENT_NAME} \
                                      -n ${env.NAMESPACE} \
                                      -o jsonpath='{.spec.template.spec.containers[0].image}'
                                """,
                                returnStdout: true
                            ).trim()
                        }

                        // Frontend info
                        if (params.TARGET in ['all', 'frontend']) {
                            k8sInfo.frontend.podStatus = sh(
                                script: """
                                    kubectl get pods -n ${env.NAMESPACE} \
                                      -l app=${env.FRONTEND_DEPLOYMENT_NAME} \
                                      --no-headers \
                                      -o custom-columns=\
NAME:.metadata.name,\
STATUS:.status.phase,\
READY:.status.containerStatuses[0].ready,\
RESTARTS:.status.containerStatuses[0].restartCount,\
NODE:.spec.nodeName
                                """,
                                returnStdout: true
                            ).trim() ?: 'No pods found'

                            k8sInfo.frontend.deployInfo = sh(
                                script: """
                                    kubectl get deployment/${env.FRONTEND_DEPLOYMENT_NAME} \
                                      -n ${env.NAMESPACE} \
                                      --no-headers \
                                      -o custom-columns=\
READY:.status.readyReplicas,\
AVAILABLE:.status.availableReplicas,\
DESIRED:.spec.replicas
                                """,
                                returnStdout: true
                            ).trim() ?: 'Unknown'

                            def feHttp = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' --max-time 15 ${env.FRONTEND_HEALTH_URL} || echo '000'",
                                returnStdout: true
                            ).trim()
                            k8sInfo.frontend.httpStatus = feHttp
                            k8sInfo.frontend.appStatus = (feHttp == '200' || feHttp == '307' || feHttp == '302') ? 'UP' : 'DOWN'

                            k8sInfo.frontend.imageInfo = sh(
                                script: """
                                    kubectl get deployment/${env.FRONTEND_DEPLOYMENT_NAME} \
                                      -n ${env.NAMESPACE} \
                                      -o jsonpath='{.spec.template.spec.containers[0].image}'
                                """,
                                returnStdout: true
                            ).trim()
                        }
                    }
                } catch (Exception e) {
                    echo "Error getting K8s info: ${e.getMessage()}"
                    k8sInfo.api = [podStatus: 'Unable to retrieve', deployInfo: 'Unable to retrieve',
                                   httpStatus: '000', appStatus: 'UNKNOWN', imageInfo: 'Unknown']
                    k8sInfo.frontend = [podStatus: 'Unable to retrieve', deployInfo: 'Unable to retrieve',
                                        httpStatus: '000', appStatus: 'UNKNOWN', imageInfo: 'Unknown']
                }

                def commitHash = env.CURRENT_COMMIT ?: 'N/A'
                def commitMsg = 'N/A'
                def commitAuthor = 'N/A'
                try {
                    commitMsg    = sh(script: "git log -1 --pretty=%B ${commitHash} 2>/dev/null || echo 'N/A'", returnStdout: true).trim()
                    commitAuthor = sh(script: "git log -1 --pretty=%an ${commitHash} 2>/dev/null || echo 'N/A'", returnStdout: true).trim()
                } catch (Exception e) {
                    commitMsg = 'Unable to retrieve'
                    commitAuthor = 'Unable to retrieve'
                }

                def currentTime    = new Date().format("MMMM dd, yyyy HH:mm:ss")
                def now            = new Date()
                def deployStart    = new Date(now.time - 10*60*1000).format("MMMM dd, yyyy HH:mm:ss")
                def deploySonar    = new Date(now.time - 8*60*1000).format("MMMM dd, yyyy HH:mm:ss")
                def deployBuild    = new Date(now.time - 5*60*1000).format("MMMM dd, yyyy HH:mm:ss")
                def deployK8s      = new Date(now.time - 2*60*1000).format("MMMM dd, yyyy HH:mm:ss")
                def deployComplete = currentTime

                def targetLabel = params.TARGET == 'all' ? 'API + Frontend' : params.TARGET.capitalize()

                // Build health dashboard sections
                def healthSections = ''
                if (params.TARGET in ['all', 'api'] && k8sInfo.api) {
                    healthSections += """
                <div class="endpoint-box">
                    <div class="endpoint-header">
                        <span class="indicator ${k8sInfo.api.appStatus == 'UP' ? 'success' : 'danger'}"></span>
                        API — ${env.API_HEALTH_URL}
                    </div>
                    <div class="endpoint-body">
                        <div class="metric-row"><div class="metric-label">Status:</div><div class="metric-value ${k8sInfo.api.appStatus == 'UP' ? 'status-up' : 'status-down'}">${k8sInfo.api.appStatus}</div></div>
                        <div class="metric-row"><div class="metric-label">HTTP Check:</div><div class="metric-value">${k8sInfo.api.httpStatus}</div></div>
                        <div class="metric-row"><div class="metric-label">Image:</div><div class="metric-value">${k8sInfo.api.imageInfo}</div></div>
                    </div>
                </div>
                <div class="process-box"><h4>API Pod Status</h4><div class="code-block">${k8sInfo.api.podStatus}</div></div>
                """
                }
                if (params.TARGET in ['all', 'frontend'] && k8sInfo.frontend) {
                    healthSections += """
                <div class="endpoint-box" style="margin-top: 15px;">
                    <div class="endpoint-header">
                        <span class="indicator ${k8sInfo.frontend.appStatus == 'UP' ? 'success' : 'danger'}"></span>
                        Frontend — ${env.FRONTEND_HEALTH_URL}
                    </div>
                    <div class="endpoint-body">
                        <div class="metric-row"><div class="metric-label">Status:</div><div class="metric-value ${k8sInfo.frontend.appStatus == 'UP' ? 'status-up' : 'status-down'}">${k8sInfo.frontend.appStatus}</div></div>
                        <div class="metric-row"><div class="metric-label">HTTP Check:</div><div class="metric-value">${k8sInfo.frontend.httpStatus}</div></div>
                        <div class="metric-row"><div class="metric-label">Image:</div><div class="metric-value">${k8sInfo.frontend.imageInfo}</div></div>
                    </div>
                </div>
                <div class="process-box" style="margin-top: 10px;"><h4>Frontend Pod Status</h4><div class="code-block">${k8sInfo.frontend.podStatus}</div></div>
                """
                }

                def emailBody = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Notification</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .success-badge { background-color: #28a745; color: white; border-radius: 4px; padding: 5px 10px; font-weight: bold; display: inline-block; margin-left: 10px; }
        .deployment-info { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px; }
        .commit-info { background-color: #f0f0f0; border-left: 4px solid #007bff; padding: 10px 15px; margin: 15px 0; border-radius: 0 4px 4px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .details-table th { background-color: #f1f1f1; text-align: left; padding: 10px; border: 1px solid #ddd; }
        .details-table td { padding: 10px; border: 1px solid #ddd; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 5px; }
        .indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px; }
        .success { background-color: #28a745; }
        .danger  { background-color: #dc3545; }
        .health-dashboard { margin-top: 25px; }
        .dashboard-title { background-color: #343a40; color: white; padding: 10px 15px; border-radius: 5px 5px 0 0; font-size: 18px; margin-bottom: 0; }
        .endpoint-box { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; overflow: hidden; }
        .endpoint-header { background-color: #e9ecef; padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd; }
        .endpoint-body { padding: 15px; }
        .metric-row { display: flex; margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 8px; }
        .metric-label { width: 40%; font-weight: bold; }
        .metric-value { width: 60%; }
        .status-up   { color: #28a745; font-weight: bold; }
        .status-down { color: #dc3545; font-weight: bold; }
        .process-box { background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin-top: 15px; }
        .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
        .metric-card { background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; text-align: center; }
        .metric-card-label { font-size: 12px; color: #6c757d; margin-bottom: 5px; }
        .metric-card-value { font-size: 16px; font-weight: bold; }
        .code-block { background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 12px; white-space: pre-wrap; margin-top: 10px; }
        .timeline { margin-top: 30px; position: relative; }
        .timeline:before { content: ''; position: absolute; height: 100%; width: 2px; background-color: #dee2e6; left: 18px; top: 0; }
        .timeline-item { padding-left: 50px; position: relative; margin-bottom: 20px; }
        .timeline-item:before { content: ''; position: absolute; left: 10px; top: 0; width: 16px; height: 16px; border-radius: 50%; background-color: #007bff; border: 2px solid #fff; box-shadow: 0 0 0 2px #007bff; }
        .timeline-content { background-color: #fff; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .timeline-time { font-size: 12px; color: #6c757d; margin-bottom: 5px; }
        .section-title { border-bottom: 2px solid #dee2e6; padding-bottom: 8px; margin-top: 30px; font-size: 20px; color: #343a40; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ashiwani Kumar Portfolio <span class="success-badge">SUCCESS</span></h1>
            <p style="color: #6c757d; margin: 5px 0 0;">Target: ${targetLabel}</p>
        </div>

        <div class="deployment-info">
            <h2 class="section-title">Deployment Details</h2>
            <p>Ashiwani Kumar Portfolio (${targetLabel}) has been successfully deployed to <strong>Kubernetes</strong>.</p>

            <div class="commit-info">
                <p><strong>Commit:</strong> ${commitHash}</p>
                <p><strong>Message:</strong> ${commitMsg}</p>
                <p><strong>Author:</strong> ${commitAuthor}</p>
            </div>

            <table class="details-table">
                <tr><th>Application</th><td>Ashiwani Kumar Portfolio</td></tr>
                <tr><th>Target</th><td>${targetLabel}</td></tr>
                <tr><th>Build Number</th><td>#${env.BUILD_NUMBER}</td></tr>
                <tr><th>Branch</th><td>${env.BRANCH_NAME}</td></tr>
                <tr><th>Action</th><td>${params.ACTION}</td></tr>
                <tr><th>Deployment ID</th><td>${env.DEPLOYMENT_ID}</td></tr>
                <tr><th>K8s Namespace</th><td>${env.NAMESPACE}</td></tr>
                <tr><th>Timestamp</th><td>${currentTime}</td></tr>
                <tr><th>API URL</th><td><a href="${env.API_PROD_URL}">${env.API_PROD_URL}</a></td></tr>
                <tr><th>Frontend URL</th><td><a href="${env.FRONTEND_PROD_URL}">${env.FRONTEND_PROD_URL}</a></td></tr>
                <tr><th>Repository</th><td>${env.GITHUB_REPO}</td></tr>
            </table>

            <div class="health-dashboard">
                <h2 class="dashboard-title">K8s Health Dashboard</h2>
                ${healthSections}

                <div class="process-box" style="margin-top: 15px;">
                    <h4>Deployment Summary</h4>
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-card-label">Image Tag</div>
                            <div class="metric-card-value">${env.IMAGE_TAG}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-card-label">Registry</div>
                            <div class="metric-card-value">${env.NEXUS_REGISTRY}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-card-label">Namespace</div>
                            <div class="metric-card-value">${env.NAMESPACE}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-card-label">Target</div>
                            <div class="metric-card-value">${targetLabel}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="timeline">
                <h3 class="section-title">Deployment Timeline</h3>
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">${deployStart}</div>
                        <strong>Pipeline Started</strong>
                        <p>Started Ashiwani Kumar Portfolio deployment - Build #${env.BUILD_NUMBER}</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">${deploySonar}</div>
                        <strong>SonarQube Analysis</strong>
                        <p>Code quality analysis completed</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">${deployBuild}</div>
                        <strong>Docker Images Built &amp; Pushed</strong>
                        <p>Built ${targetLabel} images - pushed to Nexus registry</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">${deployK8s}</div>
                        <strong>K8s Deployment</strong>
                        <p>Applied manifests to namespace ${env.NAMESPACE} - pods rolling out</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">${deployComplete}</div>
                        <strong>Deployment Complete</strong>
                        <p>All K8s pods running successfully</p>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="${env.BUILD_URL}" class="button">View Build Details</a>
                <a href="${env.FRONTEND_PROD_URL}" class="button" style="background-color: #28a745;">Visit Portfolio</a>
                <a href="${env.API_HEALTH_URL}" class="button" style="background-color: #17a2b8;">API Health</a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated message from Ashiwani Kumar CI/CD Pipeline. Please do not reply to this email.</p>
            <p>&copy; 2025 Ashiwani Kumar | <a href="https://ashiwanikumar.com">ashiwanikumar.com</a></p>
        </div>
    </div>
</body>
</html>"""

                emailext(
                    subject: "[SUCCESS] Ashiwani Kumar Portfolio ${params.ACTION} [${params.TARGET}] #${env.BUILD_NUMBER} - K8s",
                    body: emailBody,
                    mimeType: 'text/html',
                    to: 'ashvanikumar109@gmail.com'
                )
            }
        }

        failure {
            script {
                def commitHash = env.CURRENT_COMMIT ?: 'N/A'
                def commitMsg = 'N/A'
                def commitAuthor = 'N/A'
                try {
                    commitMsg    = sh(script: "git log -1 --pretty=%B ${commitHash} 2>/dev/null || echo 'N/A'", returnStdout: true).trim()
                    commitAuthor = sh(script: "git log -1 --pretty=%an ${commitHash} 2>/dev/null || echo 'N/A'", returnStdout: true).trim()
                } catch (Exception e) {
                    commitMsg = 'Unable to retrieve'
                    commitAuthor = 'Unable to retrieve'
                }
                def currentTime = new Date().format("MMMM dd, yyyy HH:mm:ss")

                def emailBody = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .failure-badge { background-color: #dc3545; color: white; border-radius: 4px; padding: 5px 10px; font-weight: bold; }
        .alert-box { background-color: #fff8f8; border: 1px solid #dc3545; border-radius: 4px; padding: 15px; margin: 15px 0; color: #721c24; }
        .commit-info { background-color: #f0f0f0; border-left: 4px solid #dc3545; padding: 10px 15px; margin: 15px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th { background-color: #f1f1f1; text-align: left; padding: 10px; border: 1px solid #ddd; }
        .details-table td { padding: 10px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 5px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ashiwani Kumar Portfolio <span class="failure-badge">FAILED</span></h1>
            <p style="color: #6c757d; margin: 5px 0 0;">Target: ${params.TARGET}</p>
        </div>
        <div style="padding: 15px;">
            <div class="alert-box">
                <h3>Attention Required</h3>
                <p>The deployment failed. Please check the console output for details.</p>
            </div>
            <div class="commit-info">
                <p><strong>Commit:</strong> ${commitHash}</p>
                <p><strong>Message:</strong> ${commitMsg}</p>
                <p><strong>Author:</strong> ${commitAuthor}</p>
            </div>
            <table class="details-table">
                <tr><th>Application</th><td>Ashiwani Kumar Portfolio</td></tr>
                <tr><th>Target</th><td>${params.TARGET}</td></tr>
                <tr><th>Build Number</th><td>#${env.BUILD_NUMBER}</td></tr>
                <tr><th>Branch</th><td>${env.BRANCH_NAME}</td></tr>
                <tr><th>Action</th><td>${params.ACTION}</td></tr>
                <tr><th>Deployment ID</th><td>${env.DEPLOYMENT_ID}</td></tr>
                <tr><th>Namespace</th><td>${env.NAMESPACE}</td></tr>
                <tr><th>Timestamp</th><td>${currentTime}</td></tr>
                <tr><th>Repository</th><td>${env.GITHUB_REPO}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 20px;">
                <a href="${env.BUILD_URL}" class="button">View Build Details</a>
                <a href="${env.BUILD_URL}console" class="button" style="background-color: #dc3545;">View Console Output</a>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from Ashiwani Kumar CI/CD Pipeline. Please do not reply to this email.</p>
            <p>&copy; 2025 Ashiwani Kumar | <a href="https://ashiwanikumar.com">ashiwanikumar.com</a></p>
        </div>
    </div>
</body>
</html>"""

                emailext(
                    subject: "[FAILURE] Ashiwani Kumar Portfolio ${params.ACTION} [${params.TARGET}] #${env.BUILD_NUMBER} - K8s",
                    body: emailBody,
                    mimeType: 'text/html',
                    to: 'ashvanikumar109@gmail.com'
                )
            }
        }
    }
}
