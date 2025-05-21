from rest_framework import serializers
from .models import GoogleApiUsageMetric, UserActivity, APIUsage, AnalyticsSummary # Adjust import if needed

class GoogleApiUsageMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoogleApiUsageMetric
        fields = '__all__'

# Keep existing serializers if any, for example:
class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = '__all__'

class APIUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIUsage
        fields = '__all__'

class AnalyticsSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSummary
        fields = '__all__'
