from rest_framework import serializers
from .models import File
from .utils import get_file_type_display

class FileSerializer(serializers.ModelSerializer):
    display_file_type = serializers.SerializerMethodField()
    storage_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'display_file_type',
                 'size', 'uploaded_at', 'reference_count', 'storage_saved',
                 'download_count', 'last_accessed', 'metadata']
        read_only_fields = ['id', 'uploaded_at', 'reference_count', 'storage_saved',
                          'download_count', 'last_accessed', 'metadata']
    
    def get_display_file_type(self, obj):
        return get_file_type_display(obj.file_type)
    
    def get_storage_saved(self, obj):
        return obj.storage_saved 