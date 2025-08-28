# GitHub Actions NPM Publishing Setup Guide

This guide explains how to set up automated NPM package publishing using GitHub Actions.

## 📋 Prerequisites

1. **NPM Account**: You need an npm account to publish packages
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Package Configuration**: Your `package.json` should be properly configured

## 🔧 Setup Instructions

### Step 1: Configure NPM Token

1. **Create NPM Access Token**:
   - Go to [npmjs.com](https://www.npmjs.com) and log in
   - Navigate to "Access Tokens" in your account settings
   - Click "Generate New Token"
   - Choose "Automation" type for CI/CD
   - Copy the generated token

2. **Add Token to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token from step 1

### Step 2: Configure Docker Hub (Optional)

If you want to publish Docker images:

1. **Create Docker Hub Account**: Sign up at [hub.docker.com](https://hub.docker.com)

2. **Add Docker Secrets**:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Step 3: Update Package.json

Ensure your `backend/package.json` has proper configuration:

```json
{
  "name": "products-demo-api",
  "version": "1.0.0",
  "description": "Complete Web API project using Node.js with TypeScript",
  "main": "dist/server.js",
  "files": [
    "dist/**/*",
    "package.json",
    "README.md"
  ],
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/products-demo-api.git"
  },
  "keywords": [
    "nodejs",
    "typescript",
    "express",
    "sql-server",
    "rest-api"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

## 🚀 Publishing Methods

### Method 1: Release-based Publishing (Recommended)

1. **Create a Release**:
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Create a new tag (e.g., `v1.0.0`)
   - Fill in release title and description
   - Click "Publish release"

2. **Automatic Publishing**:
   - The workflow will automatically trigger
   - It will run tests, build the project, and publish to npm
   - Also publishes to GitHub Package Registry and Docker Hub

### Method 2: Manual Publishing

1. **Manual Trigger**:
   - Go to Actions tab in your repository
   - Select "Publish Node.js Package" workflow
   - Click "Run workflow"
   - Optionally specify a version number
   - Click "Run workflow"

## 📦 What Gets Published

### NPM Package
- **Registry**: https://registry.npmjs.org
- **Name**: `products-demo-api`
- **Files**: Built `dist/` directory and package files

### GitHub Package Registry
- **Registry**: https://npm.pkg.github.com
- **Name**: `@yourusername/products-demo-api`
- **Scope**: Your GitHub username

### Docker Image
- **Registry**: Docker Hub
- **Name**: `yourusername/products-demo-api`
- **Tags**: Version-based tags (e.g., `latest`, `1.0.0`)

## 🔍 Workflow Features

### Testing
- **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
- **Comprehensive Checks**: Runs tests, linting, and builds
- **Fail-Safe**: Only publishes if all tests pass

### Security
- **Dependency Scanning**: Uses `npm ci` for reproducible builds
- **Token Security**: Uses GitHub secrets for sensitive data
- **Multi-Stage Docker**: Optimized Docker image with non-root user

### Notifications
- **Success Notifications**: Links to published packages
- **Failure Alerts**: Clear error reporting
- **Status Badges**: Can add workflow status badges to README

## 🛠️ Customization Options

### Version Management
```yaml
# Automatic version bump
- name: Bump version
  run: npm version patch --no-git-tag-version

# Semantic versioning
- name: Semantic Version
  uses: paulhatch/semantic-version@v5.0.2
```

### Additional Registries
```yaml
# Add more registries
- name: Publish to private registry
  run: npm publish --registry https://your-private-registry.com
```

### Conditional Publishing
```yaml
# Only publish on main branch
if: github.ref == 'refs/heads/main'

# Only publish production releases
if: github.event.release.prerelease == false
```

## 📊 Monitoring

### GitHub Actions
- Monitor workflow runs in the Actions tab
- View detailed logs for each step
- Set up email notifications for failures

### NPM Dashboard
- Track download statistics
- Monitor package versions
- Manage package settings

### Docker Hub
- View pull statistics
- Monitor image sizes
- Set up automated scans

## 🚨 Troubleshooting

### Common Issues

1. **NPM Token Invalid**:
   - Regenerate token with "Automation" type
   - Ensure token has publish permissions

2. **Tests Failing**:
   - Check test dependencies
   - Ensure environment variables are set
   - Verify database connections in CI

3. **Build Errors**:
   - Check TypeScript configuration
   - Ensure all dependencies are listed
   - Verify file paths in package.json

4. **Docker Build Fails**:
   - Check Dockerfile syntax
   - Ensure .dockerignore is correct
   - Verify multi-stage build steps

### Debug Commands
```bash
# Test build locally
npm run build

# Test Docker build
docker build -t test-image .

# Verify package files
npm pack --dry-run
```

## 🔐 Security Best Practices

1. **Token Management**:
   - Use automation tokens for CI/CD
   - Rotate tokens regularly
   - Never commit tokens to code

2. **Package Security**:
   - Review `files` array in package.json
   - Exclude sensitive files in .npmignore
   - Use `npm audit` regularly

3. **Docker Security**:
   - Use non-root user
   - Scan images for vulnerabilities
   - Keep base images updated

## 📈 Advanced Features

### Semantic Versioning
```yaml
- name: Determine version
  id: version
  uses: paulhatch/semantic-version@v5.0.2
  with:
    tag_prefix: "v"
    major_pattern: "BREAKING CHANGE:"
    minor_pattern: "feat:"
    format: "${major}.${minor}.${patch}"
```

### Slack Notifications
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Release Notes Generation
```yaml
- name: Generate Release Notes
  uses: actions/github-script@v6
  with:
    script: |
      const { data } = await github.rest.repos.generateReleaseNotes({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag_name: context.ref.replace('refs/tags/', '')
      });
```

This workflow provides a production-ready CI/CD pipeline for your Node.js package! 🎉