from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.base import ContentFile
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock

from .models import ResearchQuery, ResearchResult
from cases.models import Case
from documents.models import Document

User = get_user_model()

# Default API URL if not set in settings
DEFAULT_FASTAPI_URL = 'http://localhost:8001'

class ResearchViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Ensure related objects are created if necessary for some tests
        self.case_instance = Case.objects.create(title="Test Case", description="A case for testing", created_by=self.user)
        
        # Create a dummy file for document
        self.document_file_content = b"This is a test document content for recommendations."
        self.document_file = ContentFile(self.document_file_content, name="test_doc.txt")
        self.document_instance = Document.objects.create(
            name="Test Document", 
            description="A document for testing", 
            file=self.document_file,
            uploaded_by=self.user,
            case=self.case_instance
        )

    # --- Tests for query_gemini ---
    @patch('requests.post')
    def test_query_gemini_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'response': 'Test AI response'}
        mock_post.return_value = mock_response

        url = reverse('research-query-gemini')
        data = {'query': 'What is the meaning of life?'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'response': 'Test AI response'})
        
        self.assertTrue(ResearchQuery.objects.filter(user=self.user, query_text=data['query']).exists())
        query_obj = ResearchQuery.objects.get(user=self.user, query_text=data['query'])
        
        self.assertTrue(ResearchResult.objects.filter(query=query_obj).exists())
        result_obj = ResearchResult.objects.get(query=query_obj)
        self.assertEqual(result_obj.title, f"AI Response: {data['query'][:50]}...")
        self.assertEqual(result_obj.excerpt, 'Test AI response')
        self.assertEqual(result_obj.source, "Google Gemini AI")
        self.assertEqual(result_obj.relevance_score, 1.0)

        mock_post.assert_called_once_with(
            f"{DEFAULT_FASTAPI_URL}/api/gemini/query",
            json={
                "query": data['query'],
                "documentContext": [],
                "chatHistory": [],
                "user_id": str(self.user.id)
            },
            headers={"Content-Type": "application/json"}
        )

    def test_query_gemini_missing_query(self):
        url = reverse('research-query-gemini')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Query text is required", response.data['error'])

    @patch('requests.post')
    def test_query_gemini_fastapi_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = 'FastAPI Internal Server Error'
        mock_post.return_value = mock_response

        url = reverse('research-query-gemini')
        data = {'query': 'Test query'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("Failed to get response from Gemini API", response.data['error'])

    @patch('requests.post', side_effect=Exception("Network Error"))
    def test_query_gemini_exception(self, mock_post):
        url = reverse('research-query-gemini')
        data = {'query': 'Test query'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("An error occurred while processing your query", response.data['error'])

    # --- Tests for search_legal_databases ---
    @patch('requests.post')
    def test_search_legal_databases_success(self, mock_post):
        mock_api_response_data = {
            'items': [{
                'title': 'Test Case 1', 
                'excerpt': 'Excerpt 1', 
                'type': 'Judgment', 
                'url': 'http://example.com/1'
            }]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response_data
        mock_post.return_value = mock_response

        url = reverse('research-search-legal-databases')
        data = {
            'query': 'search for precedents', 
            'database': 'caselaw',
            'jurisdiction': 'US'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, mock_api_response_data)

        self.assertTrue(ResearchQuery.objects.filter(user=self.user, query_text=f"[{data['database']}] {data['query']}", jurisdiction=data['jurisdiction']).exists())
        query_obj = ResearchQuery.objects.get(user=self.user, query_text=f"[{data['database']}] {data['query']}")
        
        self.assertTrue(ResearchResult.objects.filter(query=query_obj).exists())
        result_obj = ResearchResult.objects.get(query=query_obj)
        self.assertEqual(result_obj.title, 'Test Case 1')
        self.assertEqual(result_obj.excerpt, 'Excerpt 1')
        self.assertEqual(result_obj.source, 'CASELAW: Judgment')
        self.assertEqual(result_obj.url, 'http://example.com/1')
        
        mock_post.assert_called_once_with(
            f"{DEFAULT_FASTAPI_URL}/api/legal-databases/search",
            json={
                "query": data['query'],
                "database": data['database'],
                "jurisdiction": data['jurisdiction'],
                "doc_type": None,
                "date_from": None,
                "date_to": None,
                "user_id": str(self.user.id)
            },
            headers={"Content-Type": "application/json"}
        )
        
    def test_search_legal_databases_missing_query(self):
        url = reverse('research-search-legal-databases')
        response = self.client.post(url, {'database': 'caselaw'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Query text is required", response.data['error'])

    @patch('requests.post')
    def test_search_legal_databases_fastapi_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = 'API Error'
        mock_post.return_value = mock_response

        url = reverse('research-search-legal-databases')
        data = {'query': 'Test search'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("Failed to search legal databases", response.data['error'])
        
    # --- Tests for comprehensive_research ---
    @patch('requests.post')
    def test_comprehensive_research_success(self, mock_post):
        mock_api_response_data = {
            'ai_response': 'Comprehensive AI analysis...', 
            'legal_database_results': [{'title': 'DB Result 1', 'excerpt': 'DB Excerpt 1', 'source': 'LexisNexis'}]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response_data
        mock_post.return_value = mock_response

        url = reverse('research-comprehensive-research')
        data = {
            'query': 'Comprehensive analysis of contract law',
            'jurisdiction': 'UK',
            'case_id': self.case_instance.id,
            'document_ids': [self.document_instance.id]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, mock_api_response_data)

        self.assertTrue(ResearchQuery.objects.filter(user=self.user, query_text=data['query'], case=self.case_instance).exists())
        query_obj = ResearchQuery.objects.get(user=self.user, query_text=data['query'])
        
        results = ResearchResult.objects.filter(query=query_obj).order_by('source') # Order for consistent testing
        self.assertEqual(results.count(), 2)
        
        ai_result = results.get(source="Google Gemini AI") # Or other configured AI
        self.assertEqual(ai_result.title, "AI Analysis")
        self.assertEqual(ai_result.excerpt, 'Comprehensive AI analysis...')
        
        db_result = results.get(source="LexisNexis")
        self.assertEqual(db_result.title, 'DB Result 1')
        
        # Verify documentContext in mock call
        # Re-fetch document to ensure its content is fresh if it's read multiple times
        self.document_instance.refresh_from_db() 
        with self.document_instance.file.open('r') as f:
            expected_doc_content = f.read()

        mock_post.assert_called_once_with(
            f"{DEFAULT_FASTAPI_URL}/api/research/comprehensive",
            json={
                "query": data['query'],
                "jurisdiction": data['jurisdiction'],
                "documentContext": [{
                    "id": str(self.document_instance.id),
                    "name": self.document_instance.name,
                    "content": expected_doc_content
                }],
                "user_id": str(self.user.id)
            },
            headers={"Content-Type": "application/json"}
        )

    def test_comprehensive_research_case_not_found(self):
        url = reverse('research-comprehensive-research')
        data = {'query': 'Test', 'case_id': 9999} # Non-existent case_id
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Case with ID 9999 not found", response.data['error'])

    @patch('requests.post')
    def test_comprehensive_research_document_not_found_but_continues(self, mock_post):
        mock_api_response_data = {'ai_response': 'Partial AI...', 'legal_database_results': []}
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response_data
        mock_post.return_value = mock_response

        url = reverse('research-comprehensive-research')
        data = {
            'query': 'Test with one valid doc and one invalid',
            'document_ids': [self.document_instance.id, 9999] # 9999 is non-existent
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.document_instance.refresh_from_db()
        with self.document_instance.file.open('r') as f:
            expected_doc_content = f.read()

        mock_post.assert_called_once()
        called_args, called_kwargs = mock_post.call_args
        self.assertEqual(len(called_kwargs['json']['documentContext']), 1)
        self.assertEqual(called_kwargs['json']['documentContext'][0]['id'], str(self.document_instance.id))
        self.assertEqual(called_kwargs['json']['documentContext'][0]['content'], expected_doc_content)

    def test_comprehensive_research_missing_query(self):
        url = reverse('research-comprehensive-research')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('requests.post')
    def test_comprehensive_research_fastapi_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "API Error"
        mock_post.return_value = mock_response

        url = reverse('research-comprehensive-research')
        data = {'query': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    # --- Tests for dashboard ---
    def test_dashboard_success_with_data(self):
        # Create some data
        q1 = ResearchQuery.objects.create(user=self.user, query_text="First query about IP law", jurisdiction="USA")
        ResearchResult.objects.create(query=q1, title="IP Result 1", source="AI")
        ResearchQuery.objects.create(user=self.user, query_text="Second query about contract law", jurisdiction="UK")
        ResearchQuery.objects.create(user=self.user, query_text="Third query also IP", jurisdiction="USA")

        url = reverse('research-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn('recent_queries', data)
        self.assertIn('jurisdictions', data)
        self.assertIn('common_terms', data)
        self.assertIn('stats', data)

        self.assertEqual(len(data['recent_queries']), 3)
        self.assertEqual(data['stats']['total_queries'], 3)
        self.assertEqual(data['stats']['total_results'], 1) # Only one result created
        self.assertAlmostEqual(data['stats']['avg_results_per_query'], 1/3)
        
        # Check jurisdictions - order might vary, so check content
        self.assertIn({'jurisdiction': 'USA', 'count': 2}, data['jurisdictions'])
        self.assertIn({'jurisdiction': 'UK', 'count': 1}, data['jurisdictions'])
        
        # Check common terms - example, actual terms depend on regex and queries
        self.assertTrue(any(term[0] == 'ip' for term in data['common_terms']))
        self.assertTrue(any(term[0] == 'law' for term in data['common_terms']))

    def test_dashboard_success_no_data(self):
        url = reverse('research-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data['recent_queries']), 0)
        self.assertEqual(len(data['jurisdictions']), 0)
        self.assertEqual(len(data['common_terms']), 0)
        self.assertEqual(data['stats']['total_queries'], 0)
        self.assertEqual(data['stats']['total_results'], 0)
        self.assertEqual(data['stats']['avg_results_per_query'], 0)

    # --- Tests for recommend_cases ---
    @patch('requests.post')
    def test_recommend_cases_success_with_description(self, mock_post):
        mock_api_response_data = {
            'recommended_cases': [{'title': 'Rec Case 1', 'summary': 'Summary 1', 'citation': '123 U.S. 456'}]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response_data
        mock_post.return_value = mock_response

        url = reverse('research-recommend-cases')
        data = {'description': 'Looking for cases on patent infringement', 'jurisdiction': 'US'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, mock_api_response_data)
        
        query_text_expected = data['description'][:50] + "..." if len(data['description']) > 50 else data['description']
        self.assertTrue(ResearchQuery.objects.filter(user=self.user, query_text=query_text_expected).exists())
        query_obj = ResearchQuery.objects.get(user=self.user, query_text=query_text_expected)
        
        self.assertTrue(ResearchResult.objects.filter(query=query_obj).exists())
        result_obj = ResearchResult.objects.get(query=query_obj)
        self.assertEqual(result_obj.title, 'Rec Case 1')
        self.assertEqual(result_obj.excerpt, 'Summary 1')
        self.assertEqual(result_obj.source, '123 U.S. 456')

        mock_post.assert_called_once_with(
            f"{DEFAULT_FASTAPI_URL}/api/research/recommend-cases",
            json={
                "context": data['description'],
                "jurisdiction": data['jurisdiction'],
                "user_id": str(self.user.id)
            },
            headers={"Content-Type": "application/json"}
        )

    def test_recommend_cases_missing_all_inputs(self):
        url = reverse('research-recommend-cases')
        response = self.client.post(url, {'jurisdiction': 'US'}, format='json') # Only jurisdiction
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Either a description, case_id, or document_id must be provided", response.data['error'])

    def test_recommend_cases_case_not_found(self):
        url = reverse('research-recommend-cases')
        response = self.client.post(url, {'case_id': 9999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Case with ID 9999 not found", response.data['error'])
        
    def test_recommend_cases_document_not_found(self):
        url = reverse('research-recommend-cases')
        response = self.client.post(url, {'document_id': 9999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Document with ID 9999 not found", response.data['error'])

    @patch('requests.post')
    def test_recommend_cases_fastapi_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "API Error"
        mock_post.return_value = mock_response

        url = reverse('research-recommend-cases')
        data = {'description': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("Failed to generate case recommendations", response.data['error'])

    @patch('requests.post')
    def test_recommend_cases_document_content_reading(self, mock_post):
        mock_api_response_data = {'recommended_cases': []}
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_api_response_data
        mock_post.return_value = mock_response

        url = reverse('research-recommend-cases')
        data = {'document_id': self.document_instance.id, 'jurisdiction': 'US'}
        self.client.post(url, data, format='json')

        # Verify content in context
        self.document_instance.refresh_from_db() # Ensure fresh read
        expected_doc_content_str = self.document_file_content.decode(errors='ignore')[:500]
        
        expected_context = f"\nDocument: {self.document_instance.name}\nContent: {expected_doc_content_str}"

        mock_post.assert_called_once()
        called_args, called_kwargs = mock_post.call_args
        self.assertEqual(called_kwargs['json']['context'], expected_context.strip())

class AdminModuleTests(APITestCase):
    def test_admin_module_import(self):
        try:
            from backend.research import admin
        except ImportError as e:
            self.fail(f"Failed to import backend.research.admin: {e}")
        self.assertTrue(True) # If import succeeds, test passes
        
    # Basic check that admin pages for models are registered (don't require login for this check)
    def test_researchquery_admin_registered(self):
        url = reverse('admin:research_researchquery_changelist')
        # We don't need to log in, just check if URL resolves, which means it's registered
        # A more robust check would involve logging in as admin and getting 200
        self.assertIsNotNone(url)

    def test_researchresult_admin_registered(self):
        url = reverse('admin:research_researchresult_changelist')
        self.assertIsNotNone(url)
