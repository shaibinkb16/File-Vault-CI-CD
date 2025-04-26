import os
from pathlib import Path
from .settings import *

DEBUG = False

# Security settings - temporarily disabled for testing
SECURE_SSL_REDIRECT = False  # Changed to False for testing
SESSION_COOKIE_SECURE = False  # Changed to False for testing
CSRF_COOKIE_SECURE = False  # Changed to False for testing
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://file-vault-cicd.netlify.app",
    "http://13.126.10.121:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
CORS_ALLOW_CREDENTIALS = True

# Allowed hosts and CSRF settings
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '13.126.10.121,localhost,127.0.0.1').split(',')
CSRF_TRUSTED_ORIGINS = [
    'https://file-vault-cicd.netlify.app',
    'http://13.126.10.121:8000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
]

# Static and media files
STATIC_ROOT = '/app/staticfiles'
MEDIA_ROOT = '/app/media'
MEDIA_URL = '/media/'
STATIC_URL = '/static/'

# Use WhiteNoise for static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Ensure static files are served
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
] 