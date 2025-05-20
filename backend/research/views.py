from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Prefetch
from .models import ResearchQuery, ResearchResult
from .serializers import ResearchQuerySerializer, ResearchResultSerializer
# from .services import perform_ai_research # Placeholder for AI service call

class ResearchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling AI-powered legal research tasks.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResearchQuerySerializer
    
    def get_queryset(self):
        """
        Return queries for the current user only.
        Optionally filter by case if specified.
        """
        queryset = ResearchQuery.objects.filter(user=self.request.user)
        
        # Filter by case if a case_id is provided in query params
        case_id = self.request.query_params.get('case_id', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
            
        return queryset.prefetch_related(
            Prefetch('results', queryset=ResearchResult.objects.order_by('-relevance_score'))
        ).order_by('-timestamp')
        
    @action(detail=False, methods=['get'])
    def case_research(self, request):
        """
        Get research queries associated with a specific case.
        Requires case_id query parameter.
        """
        case_id = request.query_params.get('case_id')
        if not case_id:
            return Response(
                {"error": "case_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        queryset = self.get_queryset().filter(case_id=case_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def perform_search(self, request):
        """
        Performs a legal research query using an integrated LLM.
        """
        query_text = request.data.get('query')
        jurisdiction = request.data.get('jurisdiction')
        case_id = request.data.get('case_id')

        if not query_text:
            return Response({"error": "Query text is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save the query to the database
            create_data = {
                'user': request.user,
                'query_text': query_text,
                'jurisdiction': jurisdiction
            }
            
            # Add case reference if provided
            if case_id:
                try:
                    from cases.models import Case
                    case = Case.objects.get(id=case_id)
                    create_data['case'] = case
                except Case.DoesNotExist:
                    return Response({"error": f"Case with ID {case_id} not found."}, 
                                   status=status.HTTP_400_BAD_REQUEST)
            
            research_query = ResearchQuery.objects.create(**create_data)
            
            # Placeholder: Call a service function to interact with the LLM API
            # ai_results = perform_ai_research(query_text, jurisdiction)
            
            # Mock results for now - in production this would be real AI results
            mock_results = [
                {"title": f"Mock Result 1 for '{query_text}'", "excerpt": "Relevant excerpt...", "source": "Case Law DB", "relevance_score": 0.95},
                {"title": f"Mock Result 2 for '{query_text}'", "excerpt": "Another relevant excerpt...", "source": "Statute DB", "relevance_score": 0.88},
            ]
            
            # Save mock results to database
            for result in mock_results:
                ResearchResult.objects.create(
                    query=research_query,
                    title=result['title'],
                    excerpt=result['excerpt'],
                    source=result['source'],
                    relevance_score=result['relevance_score']
                )
            
            # Return serialized query with results
            serializer = self.get_serializer(research_query)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Log the exception e
            return Response({"error": f"An error occurred during research: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            # Log the exception e
            return Response({"error": "An error occurred during research."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post']) # Assuming document ID is passed in URL
    def analyze_document(self, request, pk=None):
        """
        Analyzes a specific document using an integrated LLM.
        Requires document ID (pk).
        """
        try:
            # Import document model here to avoid circular imports
            from documents.models import Document
            
            # Check for case_id in request data
            case_id = request.data.get('case_id')
            case = None
            
            if case_id:
                try:
                    from cases.models import Case
                    case = Case.objects.get(id=case_id)
                except Case.DoesNotExist:
                    return Response({"error": f"Case with ID {case_id} not found."}, 
                                  status=status.HTTP_400_BAD_REQUEST)
            
            try:
                document = Document.objects.get(pk=pk)
                # In production, add access control checks here
                # e.g., check if the document belongs to a case the user has access to
                
                # Mock analysis for now - in production call an actual AI service
                analysis = {
                    "summary": "This document appears to be a standard non-disclosure agreement.",
                    "key_clauses": ["Confidentiality", "Term", "Governing Law"],
                    "potential_issues": ["Ambiguity in definition of 'Confidential Information'"],
                }
                
                # If case is provided, add case-specific analysis
                if case:
                    analysis["case_relevance"] = f"This document is directly relevant to the {case.title} case as it establishes confidentiality requirements between the parties involved."
                
                # Create query data with or without case reference
                query_data = {
                    'user': request.user,
                    'query_text': f"Document Analysis: {document.name}",
                }
                
                if case:
                    query_data['case'] = case
                
                # Save the research query
                research_query = ResearchQuery.objects.create(**query_data)
                
                for i, clause in enumerate(analysis["key_clauses"]):
                    ResearchResult.objects.create(
                        query=research_query,
                        title=f"Key Clause: {clause}",
                        excerpt=f"Analysis of the {clause} clause",
                        source=document.name,
                        relevance_score=0.9 - (i * 0.1)  # Just for ordering
                    )
                
                return Response(analysis, status=status.HTTP_200_OK)
            except Document.DoesNotExist:
                return Response({"error": "Document not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the exception e
            return Response({"error": f"An error occurred during document analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# If using ModelViewSet, it would look more like this:
# class ResearchQueryViewSet(viewsets.ModelViewSet):
#     queryset = ResearchQuery.objects.all()
#     serializer_class = ResearchQuerySerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         # Filter queries by user or organization
#         return ResearchQuery.objects.filter(user=self.request.user)
