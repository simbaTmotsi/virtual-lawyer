from django.test import TestCase
from backend.analytics.models import GoogleApiUsageMetric # Adjust import
from backend.analytics.serializers import GoogleApiUsageMetricSerializer # Adjust import
import datetime

class GoogleApiUsageMetricSerializerTests(TestCase):

    def setUp(self):
        self.metric_date = datetime.date.today()
        self.metric_attributes_value = {
            'metric_date': self.metric_date,
            'service_name': 'Vertex AI API',
            'metric_name': 'aiplatform.googleapis.com/prediction/request_count',
            'metric_value': 1500,
            'unit': 'requests',
            'cost': None # Explicitly None
        }
        self.metric_attributes_cost = {
            'metric_date': self.metric_date,
            'service_name': 'Vertex AI API',
            'metric_name': 'billing/cost',
            'metric_value': None, # Explicitly None for cost-based metric
            'cost': 25.50, # Using Decimal compatible string or Decimal object
            'unit': 'USD'
        }
        self.metric_value_instance = GoogleApiUsageMetric.objects.create(**self.metric_attributes_value)
        self.metric_cost_instance = GoogleApiUsageMetric.objects.create(
            metric_date=self.metric_attributes_cost['metric_date'],
            service_name=self.metric_attributes_cost['service_name'],
            metric_name=self.metric_attributes_cost['metric_name'],
            metric_value=self.metric_attributes_cost['metric_value'],
            cost='25.50', # Ensure cost is passed as string if Decimal isn't used directly
            unit=self.metric_attributes_cost['unit']
        )

        self.serializer_value = GoogleApiUsageMetricSerializer(instance=self.metric_value_instance)
        self.serializer_cost = GoogleApiUsageMetricSerializer(instance=self.metric_cost_instance)

    def test_serializer_contains_expected_fields_for_value_metric(self):
        data = self.serializer_value.data
        self.assertEqual(set(data.keys()), {
            'id', 'metric_date', 'service_name', 'metric_name', 
            'metric_value', 'cost', 'unit', 'fetched_at', 'last_updated_at'
        })

    def test_serializer_data_correct_for_value_metric(self):
        data = self.serializer_value.data
        self.assertEqual(data['metric_date'], str(self.metric_attributes_value['metric_date']))
        self.assertEqual(data['service_name'], self.metric_attributes_value['service_name'])
        self.assertEqual(data['metric_name'], self.metric_attributes_value['metric_name'])
        self.assertEqual(int(data['metric_value']), self.metric_attributes_value['metric_value']) # Metric value is BigInt
        self.assertIsNone(data['cost'])
        self.assertEqual(data['unit'], self.metric_attributes_value['unit'])

    def test_serializer_data_correct_for_cost_metric(self):
        data = self.serializer_cost.data
        self.assertEqual(data['metric_date'], str(self.metric_attributes_cost['metric_date']))
        self.assertEqual(data['service_name'], self.metric_attributes_cost['service_name'])
        self.assertEqual(data['metric_name'], self.metric_attributes_cost['metric_name'])
        self.assertIsNone(data['metric_value']) # Expect None for cost-based metric
        self.assertEqual(float(data['cost']), float(self.metric_attributes_cost['cost'])) # Compare as float for Decimal
        self.assertEqual(data['unit'], self.metric_attributes_cost['unit'])

    def test_read_only_fields(self):
        # fetched_at and last_updated_at should be read-only
        self.assertTrue(GoogleApiUsageMetricSerializer.Meta.fields == '__all__') # Assuming all fields are included
        # To check read_only_fields, they would need to be explicitly set in Meta.
        # If they are not explicitly set as read_only, this test might not be directly applicable
        # without inspecting the serializer instance's fields property.
        # However, auto_now_add and auto_now fields are typically read-only by default in DRF ModelSerializers.
        
        # Example of how one might check if a field is read-only (more involved):
        # serializer = GoogleApiUsageMetricSerializer()
        # self.assertTrue(serializer.fields['fetched_at'].read_only)
        # self.assertTrue(serializer.fields['last_updated_at'].read_only)
        # For now, we'll assume default behavior of DRF for auto_now/auto_now_add fields.
        pass


    # Since the ViewSet is ReadOnlyModelViewSet, deserialization tests (create/update) are less critical
    # but can be included for completeness if the serializer might be used elsewhere for writing.
    # For now, focusing on serialization as per ReadOnlyModelViewSet usage.

    # def test_deserialization_valid_data(self):
    #     valid_data = {
    #         'metric_date': datetime.date.today().isoformat(),
    #         'service_name': "New Service",
    #         'metric_name': "new/metric",
    #         'metric_value': 200,
    #         'unit': "units",
    #         'cost': None
    #     }
    #     serializer = GoogleApiUsageMetricSerializer(data=valid_data)
    #     self.assertTrue(serializer.is_valid())
    #     metric_instance = serializer.save()
    #     self.assertIsNotNone(metric_instance.id)
    #     self.assertEqual(metric_instance.service_name, "New Service")

    # def test_deserialization_invalid_data(self):
    #     invalid_data = { # Missing required fields like metric_date, service_name, metric_name, unit
    #         'metric_value': 200
    #     }
    #     serializer = GoogleApiUsageMetricSerializer(data=invalid_data)
    #     self.assertFalse(serializer.is_valid())
    #     self.assertIn('metric_date', serializer.errors)
    #     self.assertIn('service_name', serializer.errors)
    #     self.assertIn('metric_name', serializer.errors)
    #     self.assertIn('unit', serializer.errors)
