from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationStatusSerializer(serializers.Serializer):
    status = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    authenticated = serializers.BooleanField(read_only=True)
    unread_count = serializers.IntegerField(read_only=True, default=0)
