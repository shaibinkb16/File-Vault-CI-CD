#!/bin/bash

# Create a temporary directory for the submission
SUBMISSION_DIR="abnormal_file_hub_submission"
mkdir -p "$SUBMISSION_DIR"

# Copy backend files
mkdir -p "$SUBMISSION_DIR/backend"
cp -r backend/* "$SUBMISSION_DIR/backend/"

# Copy frontend files
mkdir -p "$SUBMISSION_DIR/frontend"
cp -r frontend/* "$SUBMISSION_DIR/frontend/"

# Copy Docker configuration files
cp docker-compose.yml "$SUBMISSION_DIR/"
cp backend/Dockerfile "$SUBMISSION_DIR/backend/"
cp backend/Dockerfile.test "$SUBMISSION_DIR/backend/"
cp frontend/Dockerfile "$SUBMISSION_DIR/frontend/"
cp frontend/Dockerfile.test "$SUBMISSION_DIR/frontend/"

# Copy README and other documentation
cp README.md "$SUBMISSION_DIR/"

# Create zip file
zip -r "abnormal_file_hub_submission.zip" "$SUBMISSION_DIR"

# Clean up
rm -rf "$SUBMISSION_DIR"

echo "Submission zip file created: abnormal_file_hub_submission.zip" 