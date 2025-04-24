from django.db import models
import uuid
import os
import json

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_hash = models.CharField(max_length=64, db_index=True)  # For deduplication
    reference_count = models.IntegerField(default=1)  # Track duplicates
    download_count = models.IntegerField(default=0)  # Track downloads
    last_accessed = models.DateTimeField(null=True, blank=True)  # Track last access
    metadata = models.JSONField(default=dict, blank=True)  # Store file metadata
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['file_type']),
            models.Index(fields=['size']),
            models.Index(fields=['uploaded_at']),
            models.Index(fields=['original_filename']),
        ]
    
    def __str__(self):
        return self.original_filename
    
    @property
    def storage_saved(self):
        """Calculate storage saved through deduplication"""
        return (self.reference_count - 1) * self.size
    
    def track_access(self):
        """Track file access"""
        self.download_count += 1
        self.last_accessed = models.DateTimeField(auto_now=True)
        self.save()
