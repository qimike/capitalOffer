# ECS Deployment Guide for capitalOffer

## 1. Architecture Overview

The capitalOffer full-stack application is deployed to AWS ECS using Fargate. The architecture includes:

- **Frontend**: Vue.js application served by nginx container
- **Backend**: Django REST API running on port 3000
- **Database**: PostgreSQL 15 (managed by RDS or container)
- **Network**: AWS VPC with awsvpc networking mode
- **Load Balancing**: Application Load Balancer (ALB) in front of ECS services

### Container Flow

```
Frontend (nginx) ← depends on → Backend (Django) ← depends on → Database (PostgreSQL)
```

## 2. Prerequisites

### Required Tools

1. **AWS CLI** (v2 or later)
   ```bash
   brew install awscli
   aws --version
   ```

2. **Docker** (latest version)
   ```bash
   brew install --cask docker
   docker --version
   ```

3. **Git** (for version tags)
   ```bash
   brew install git
   git --version
   ```

### AWS Configuration

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Set your account ID as environment variable:
   ```bash
   export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   ```

3. Set AWS region:
   ```bash
   export AWS_DEFAULT_REGION=us-east-1
   ```

## 3. Step-by-Step Deployment Instructions

### Step 1: Prepare ECR Repositories

Run the build script which creates ECR repositories automatically:

```bash
chmod +x build-and-push-ecs.sh
export ACCOUNT_ID=<your-aws-account-id>
./build-and-push-ecs.sh
```

### Step 2: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name capitaloffer-cluster \
  --region us-east-1
```

### Step 3: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-prod.json \
  --region us-east-1
```

### Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster capitaloffer-cluster \
  --service-name capitaloffer-service \
  --task-definition app-prod-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --region us-east-1
```

### Step 5: Register Container Instances (if using EC2 launch type)

```bash
ecs-register-container-instances
```

### Step 6: Update Service to Use Latest Task Definition

```bash
aws ecs register-task-definition \
  --task-definition arn:aws:ecs:us-east-1:<ACCOUNT_ID>:task-definition/app-prod-task:1 \
  --cli-input-json file://ecs-task-prod.json \
  --region us-east-1

aws ecs update-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --task-definition app-prod-task:2 \
  --force-new-deployment \
  --region us-east-1
```

## 4. How to Build and Push Images

### Automated Build (Recommended)

```bash
export ACCOUNT_ID=<your-aws-account-id>
export AWS_REGION=us-east-1

chmod +x build-and-push-ecs.sh
./build-and-push-ecs.sh
```

### Manual Build

#### Backend Image

```bash
cd base-app/src/backend
docker build -t app-backend:latest .
docker tag app-backend:latest ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/app-backend:latest
docker push ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/app-backend:latest
cd ../../../..
```

#### Frontend Image

```bash
cd base-app
docker build -f src/frontend/Dockerfile.ecs -t app-frontend-prod:latest .
docker tag app-frontend-prod:latest ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/app-frontend-prod:latest
docker push ${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/app-frontend-prod:latest
cd ..
```

## 5. How to Register Task Definition

### Manual Registration

```bash
# Validate JSON first
cat ecs-task-prod.json | jq .

# Register with AWS
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-prod.json \
  --region us-east-1
```

### Using Task Definition ARN

```bash
# Get existing task definition
aws ecs describe-task-definition \
  --task-definition app-prod-task \
  --region us-east-1
```

### Update Task Definition JSON

Before registering, replace `<ACCOUNT_ID>` in ecs-task-prod.json with your actual AWS account ID.

## 6. How to Create/Update ECS Service

### Create New Service

```bash
aws ecs create-service \
  --cluster capitaloffer-cluster \
  --service-name capitaloffer-service \
  --task-definition app-prod-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

### Update Existing Service

```bash
# Update to new task definition
aws ecs update-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --task-definition app-prod-task:2 \
  --force-new-deployment \
  --region us-east-1

# Increase/decrease desired count
aws ecs update-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --desired-count 3 \
  --region us-east-1
```

### Deploy to Load Balancer

```bash
aws elbv2 create-target-group \
  --name capitaloffer-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx

aws elbv2 create-load-balancer \
  --name capitaloffer-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:<ACCOUNT_ID>:targetgroup/capitaloffer-backend-tg/xxxxx \
  --targets Id=i-xxxxx \

aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:<ACCOUNT_ID>:loadbalancer/app/capitaloffer-alb/xxxxx \
  --port 80 \
  --protocol HTTP \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<ACCOUNT_ID>:targetgroup/capitaloffer-backend-tg/xxxxx
```

## 7. Troubleshooting Section

### Check Container Logs

```bash
# Get log stream names
aws logs describe-log-streams \
  --log-group-name "/ecs/capitaloffer-backend" \
  --region us-east-1

# Tail logs
aws logs tail /ecs/capitaloffer-backend --follow --region us-east-1
aws logs tail /ecs/capitaloffer-frontend --follow --region us-east-1
```

### Debug Container

```bash
# Execute command in running container
aws ecs execute-command \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --container backend \
  --interactive \
  --command "/bin/sh"
```

### Common Issues

#### Health Check Failing

```bash
# Check health status
aws ecs describe-services \
  --cluster capitaloffer-cluster \
  --services capitaloffer-service \
  --region us-east-1

# Check container state
aws ecs describe-tasks \
  --cluster capitaloffer-cluster \
  --tasks <task-arn> \
  --region us-east-1
```

#### Container Crashing on Start

```bash
# Check exit code and logs
aws ecs describe-tasks \
  --cluster capitaloffer-cluster \
  --tasks <task-arn> \
  --region us-east-1

# View detailed logs
aws logs filter-log-events \
  --log-group-name "/ecs/capitaloffer-backend" \
  --start-time $(date -d "5 minutes ago" +%s000000000) \
  --region us-east-1
```

#### Service Not Reaching Healthy State

```bash
# Check task definition
aws ecs describe-task-definition \
  --task-definition app-prod-task \
  --region us-east-1

# Verify security groups
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --region us-east-1
```

## 8. Monitoring and Logging Instructions

### CloudWatch Logs Setup

Enable detailed logging in ECS task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/capitaloffer-backend",
    "awslogs-region": "us-east-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

### CloudWatch Metrics

```bash
# Get ECS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=capitaloffer-cluster Name=ServiceName,Value=capitaloffer-service \
  --start-time $(date -d "1 hour ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1
```

### ECS Cluster Dashboard

Access ECS monitoring in AWS Console:
- Navigate to ECS Dashboard
- Select "capitaloffer-cluster"
- Click on service to view metrics

### Enable ECS Container Insights

```bash
aws ecs put-account-setting-default \
  --name containerInsights \
  --value enabled \
  --region us-east-1
```

### Set Up Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name cpu-high-alarm \
  --alarm-description "CPU utilization > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:<ACCOUNT_ID>:ecs-alerts \
  --dimensions Name=ClusterName,Value=capitaloffer-cluster Name=ServiceName,Value=capitaloffer-service \
  --region us-east-1

# Memory utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name memory-high-alarm \
  --alarm-description "Memory utilization > 80%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:<ACCOUNT_ID>:ecs-alerts \
  --region us-east-1
```

### SNS Notification Setup

```bash
# Create SNS topic
aws sns create-topic \
  --name ecs-alerts \
  --region us-east-1

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:<ACCOUNT_ID>:ecs-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

---

## Quick Reference Commands

```bash
# View services
aws ecs list-services --cluster capitaloffer-cluster

# View tasks
aws ecs list-tasks --cluster capitaloffer-cluster --service-name capitaloffer-service

# Stop service
aws ecs update-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --desired-count 0 \
  --region us-east-1

# Start service
aws ecs update-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --desired-count 2 \
  --region us-east-1

# Delete service
aws ecs delete-service \
  --cluster capitaloffer-cluster \
  --service capitaloffer-service \
  --force \
  --region us-east-1
```
