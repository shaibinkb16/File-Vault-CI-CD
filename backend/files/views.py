from django.shortcuts import render
from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import File
from .serializers import FileSerializer
from .utils import calculate_file_hash
import os
from datetime import datetime

# Create your views here.

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['uploaded_at', 'size', 'original_filename']
    
    def create(self, request, *args, **kwargs):
        # Handle batch upload
        if 'files' in request.FILES:
            files = request.FILES.getlist('files')
            results = []
            
            for file_obj in files:
                result = self._process_single_file(file_obj)
                results.append(result)
            
            return Response(results, status=status.HTTP_201_CREATED)
        
        # Handle single file upload
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = self._process_single_file(file_obj)
        return Response(result, status=status.HTTP_201_CREATED)
    
    def _process_single_file(self, file_obj):
        """Process a single file upload"""
        # Calculate file hash for deduplication
        file_hash = calculate_file_hash(file_obj)
        
        with transaction.atomic():
            # Check for existing file with same hash
            existing_file = File.objects.filter(file_hash=file_hash).first()
            
            if existing_file:
                # Increment reference count for duplicate file
                existing_file.reference_count += 1
                existing_file.save()
                return {
                    'status': 'duplicate',
                    'message': 'File already exists',
                    'file': FileSerializer(existing_file).data
                }
            
            # Extract metadata
            metadata = {
                'filename': file_obj.name,
                'content_type': file_obj.content_type,
                'size': file_obj.size,
                'upload_date': datetime.now().isoformat(),
                'extension': os.path.splitext(file_obj.name)[1].lower()
            }
            
            # Process new file
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size,
                'file_hash': file_hash,
                'metadata': metadata
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return serializer.data
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.track_access()  # Track file access
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        with transaction.atomic():
            if instance.reference_count > 1:
                # Decrease reference count if file has duplicates
                instance.reference_count -= 1
                instance.save()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            # Delete file if no more references
            return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        queryset = self.get_queryset()
        
        # Apply filters
        name = request.query_params.get('name')
        file_type = request.query_params.get('type')
        size_min = request.query_params.get('size_min')
        size_max = request.query_params.get('size_max')
        
        if name:
            queryset = queryset.filter(
                Q(original_filename__icontains=name) |
                Q(file_type__icontains=name)
            )
        
        if file_type:
            queryset = queryset.filter(file_type__iexact=file_type)
        
        if size_min:
            queryset = queryset.filter(size__gte=int(size_min))
        
        if size_max:
            queryset = queryset.filter(size__lte=int(size_max))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
