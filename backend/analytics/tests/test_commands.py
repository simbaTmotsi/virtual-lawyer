from django.core.management import call_command
from django.test import TestCase
from django.utils.six import StringIO # For Python 2/3 compatibility, or use io.StringIO for Python 3+
# from io import StringIO # Preferred for Python 3
from backend.analytics.models import GoogleApiUsageMetric # Adjust import
import datetime

class FetchGoogleApiMetricsCommandTests(TestCase):

    def test_command_runs_successfully_and_creates_metrics(self):
        out = StringIO()
        call_command('fetch_google_api_metrics', stdout=out)

        self.assertIn("Starting to fetch Google API metrics (using mocked data)...", out.getvalue())
        self.assertIn("Successfully created metric:", out.getvalue()) # Check for at least one creation
        self.assertIn("Mocked Google API metrics fetch complete.", out.getvalue())

        # Verify data based on the mocked data in the command
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        two_days_ago = datetime.date.today() - datetime.timedelta(days=2)

        # Check one specific metric created for yesterday
        metric_yesterday_requests = GoogleApiUsageMetric.objects.filter(
            metric_date=yesterday,
            service_name='Vertex AI API',
            metric_name='aiplatform.googleapis.com/prediction/request_count',
            unit='requests'
        ).first()
        self.assertIsNotNone(metric_yesterday_requests)
        self.assertEqual(metric_yesterday_requests.metric_value, 1250)

        # Check one specific cost metric created for yesterday
        metric_yesterday_cost = GoogleApiUsageMetric.objects.filter(
            metric_date=yesterday,
            service_name='Vertex AI API',
            metric_name='billing/cost',
            unit='USD'
        ).first()
        self.assertIsNotNone(metric_yesterday_cost)
        self.assertEqual(metric_yesterday_cost.cost, 15.75)
        self.assertIsNone(metric_yesterday_cost.metric_value) # metric_value should be None for cost entries

        # Check count of metrics created (should be 4 from the mocked data)
        self.assertEqual(GoogleApiUsageMetric.objects.count(), 4)

    def test_command_updates_existing_metrics(self):
        # Pre-populate a metric that the command will try to update
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        GoogleApiUsageMetric.objects.create(
            metric_date=yesterday,
            service_name='Vertex AI API',
            metric_name='aiplatform.googleapis.com/prediction/request_count',
            unit='requests',
            metric_value=100 # Old value
        )
        self.assertEqual(GoogleApiUsageMetric.objects.count(), 1)

        out = StringIO()
        call_command('fetch_google_api_metrics', stdout=out)

        self.assertIn("Successfully updated metric:", out.getvalue())
        
        # Verify the metric was updated
        updated_metric = GoogleApiUsageMetric.objects.get(
            metric_date=yesterday,
            service_name='Vertex AI API',
            metric_name='aiplatform.googleapis.com/prediction/request_count',
            unit='requests'
        )
        self.assertEqual(updated_metric.metric_value, 1250) # New value from command's mock data
        
        # Total count should be 4 (1 updated, 3 new created)
        self.assertEqual(GoogleApiUsageMetric.objects.count(), 4)

    def test_command_output_contains_expected_messages(self):
        out = StringIO()
        call_command('fetch_google_api_metrics', stdout=out)
        output = out.getvalue()

        self.assertTrue(output.startswith("Starting to fetch Google API metrics (using mocked data)..."))
        self.assertIn("Successfully created metric: Vertex AI API - aiplatform.googleapis.com/prediction/request_count on", output)
        self.assertIn("Successfully created metric: Vertex AI API - billing/cost on", output)
        self.assertTrue(output.strip().endswith("Mocked Google API metrics fetch complete."))
        
        # Count occurrences of "Successfully created" or "Successfully updated"
        # Based on clean DB, it should be 4 "created"
        self.assertEqual(output.count("Successfully created metric:"), 4)
        self.assertEqual(output.count("Successfully updated metric:"), 0)

    # (Conceptual) If the command had date arguments:
    # def test_command_with_date_arguments(self):
    #     out = StringIO()
    #     # Assuming the command is modified to accept --start-date and --end-date
    #     # call_command('fetch_google_api_metrics', '--start-date=YYYY-MM-DD', '--end-date=YYYY-MM-DD', stdout=out)
    #     # Then assert based on those dates.
    #     # For now, this is a placeholder as the current command doesn't take args.
    #     pass
