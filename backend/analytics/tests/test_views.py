from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from backend.analytics.models import GoogleApiUsageMetric # Adjust import
from backend.analytics.serializers import GoogleApiUsageMetricSerializer # Adjust import
import datetime

User = get_user_model()

class GoogleApiUsageMetricViewSetTests(APITestCase):

    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_superuser(
            username='admin_test', email='admin@example.com', password='password123'
        )
        self.regular_user = User.objects.create_user(
            username='user_test', email='user@example.com', password='password123'
        )

        # Create some test data
        self.today = datetime.date.today()
        self.yesterday = self.today - datetime.timedelta(days=1)
        
        self.metric1 = GoogleApiUsageMetric.objects.create(
            metric_date=self.today,
            service_name="Vertex AI API",
            metric_name="aiplatform.googleapis.com/prediction/request_count",
            metric_value=1000,
            unit="requests"
        )
        self.metric2 = GoogleApiUsageMetric.objects.create(
            metric_date=self.today,
            service_name="Vertex AI API",
            metric_name="billing/cost",
            cost=50.75,
            unit="USD"
        )
        self.metric3 = GoogleApiUsageMetric.objects.create(
            metric_date=self.yesterday,
            service_name="Google Maps API",
            metric_name="maps.googleapis.com/directions/call_count",
            metric_value=500,
            unit="calls"
        )
        self.metric4 = GoogleApiUsageMetric.objects.create(
            metric_date=self.yesterday,
            service_name="Vertex AI API",
            metric_name="aiplatform.googleapis.com/prediction/request_count",
            metric_value=800,
            unit="requests"
        )
        
        # The URL for the list view. Ensure `basename` in urls.py matches 'googleapimetric'
        self.list_url = reverse('googleapimetric-list') 

    def test_list_metrics_as_admin_user(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        metrics = GoogleApiUsageMetric.objects.all().order_by('-metric_date') # Default ordering
        serializer = GoogleApiUsageMetricSerializer(metrics, many=True)
        
        self.assertEqual(len(response.data['results']), 4) # Assuming pagination is on by default
        self.assertEqual(response.data['results'], serializer.data)


    def test_list_metrics_as_regular_user_permission_denied(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_metrics_unauthenticated_permission_denied(self):
        self.client.logout() # Ensure no user is authenticated
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # DRF default for IsAdminUser

    def test_filter_by_metric_date(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'metric_date': self.today.isoformat()})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        metric_dates_in_response = {item['metric_date'] for item in response.data['results']}
        self.assertEqual(metric_dates_in_response, {self.today.isoformat()})

    def test_filter_by_service_name(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'service_name': "Vertex AI API"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3) # metric1, metric2, metric4
        service_names_in_response = {item['service_name'] for item in response.data['results']}
        self.assertEqual(service_names_in_response, {"Vertex AI API"})

    def test_filter_by_metric_name(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'metric_name': "aiplatform.googleapis.com/prediction/request_count"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2) # metric1, metric4
        metric_names_in_response = {item['metric_name'] for item in response.data['results']}
        self.assertEqual(metric_names_in_response, {"aiplatform.googleapis.com/prediction/request_count"})

    def test_filter_by_unit(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'unit': "USD"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1) # metric2
        self.assertEqual(response.data['results'][0]['unit'], "USD")

    def test_ordering_by_cost_ascending(self):
        # Create another cost metric to test ordering
        GoogleApiUsageMetric.objects.create(
            metric_date=self.today, service_name="Another Service", metric_name="billing/cost",
            cost=20.00, unit="USD"
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url, {'ordering': 'cost', 'unit': 'USD'}) # Filter by unit to get only cost items
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        # Costs should be [20.00, 50.75]
        self.assertEqual(float(response.data['results'][0]['cost']), 20.00)
        self.assertEqual(float(response.data['results'][1]['cost']), 50.75)

    def test_ordering_by_metric_value_descending(self):
        self.client.force_authenticate(user=self.admin_user)
        # Filter to get only "requests" unit to have comparable metric_value
        response = self.client.get(self.list_url, {'ordering': '-metric_value', 'unit': 'requests'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2) # metric1 and metric4
        # Values should be [1000, 800]
        self.assertEqual(int(response.data['results'][0]['metric_value']), 1000)
        self.assertEqual(int(response.data['results'][1]['metric_value']), 800)
        
    def test_retrieve_single_metric_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        detail_url = reverse('googleapimetric-detail', kwargs={'pk': self.metric1.pk})
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = GoogleApiUsageMetricSerializer(self.metric1)
        self.assertEqual(response.data, serializer.data)

    # ViewSet is ReadOnly, so no POST, PUT, PATCH, DELETE tests needed.
    def test_create_metric_not_allowed(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.list_url, data={'metric_date': self.today.isoformat(), 'service_name': 'test', 'metric_name': 'test', 'unit': 'test'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_metric_not_allowed(self):
        self.client.force_authenticate(user=self.admin_user)
        detail_url = reverse('googleapimetric-detail', kwargs={'pk': self.metric1.pk})
        response = self.client.put(detail_url, data={'metric_value': 2000})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_metric_not_allowed(self):
        self.client.force_authenticate(user=self.admin_user)
        detail_url = reverse('googleapimetric-detail', kwargs={'pk': self.metric1.pk})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
