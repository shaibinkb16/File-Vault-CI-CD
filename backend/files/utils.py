import hashlib

def calculate_file_hash(file):
    """Calculate SHA-256 hash of uploaded file"""
    sha256 = hashlib.sha256()
    for chunk in file.chunks():
        sha256.update(chunk)
    return sha256.hexdigest()

def get_file_type_display(file_type):
    """Convert MIME type to user-friendly display"""
    common_types = {
        'application/pdf': 'PDF',
        'image/jpeg': 'JPEG Image',
        'image/png': 'PNG Image',
        'text/plain': 'Text File',
        'application/msword': 'Word Document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    }
    return common_types.get(file_type, file_type) 