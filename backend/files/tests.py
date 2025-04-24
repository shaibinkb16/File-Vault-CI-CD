from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from .models import File
import os
import tempfile
from django.urls import reverse
from django.core.files.storage import default_storage

class FileUploadTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test files
        self.test_file = SimpleUploadedFile(
            "test.txt",
            b"test content",
            content_type="text/plain"
        )
    
    def test_file_upload(self):
        """Test basic file upload"""
        url = reverse('file-list')
        response = self.client.post(url, {'file': self.test_file}, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(File.objects.exists())
    
    def test_file_search(self):
        """Test file search functionality"""
        # Upload a file first
        self.client.post(reverse('file-list'), {'file': self.test_file}, format='multipart')
        
        # Test search
        url = reverse('file-search')
        response = self.client.get(f"{url}?name=test")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
    
    def test_file_delete(self):
        """Test file deletion"""
        # Upload a file
        response = self.client.post(reverse('file-list'), {'file': self.test_file}, format='multipart')
        file_id = response.data['id']
        
        # Delete the file
        delete_url = reverse('file-detail', args=[file_id])
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(File.objects.filter(id=file_id).exists())
    
    def tearDown(self):
        # Clean up test files
        for file in File.objects.all():
            if file.file and default_storage.exists(file.file.name):
                default_storage.delete(file.file.name)
        File.objects.all().delete() 