from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for the Document model"""
    file_size = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    case_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'uploaded_by_name', 'case_title', 'file_size')
    
    def get_file_size(self, obj):
        """Return human-readable file size"""
        return obj.get_file_size()
    
    def get_uploaded_by_name(self, obj):
        """Return the name of the user who uploaded the document"""
        if obj.uploaded_by:
            return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}"
        return None
    
    def get_case_title(self, obj):
        """Return the title of the associated case"""
        if obj.case:
            return obj.case.title
        return None

    def create(self, validated_data):
        """Create a new document with the current user as uploader"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        return super().create(validated_data)
