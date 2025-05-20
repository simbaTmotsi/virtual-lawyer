from django.db import models
from django.conf import settings
from cases.models import Case # Import Case model for case-based research

# Create your research models here

class ResearchQuery(models.Model):
    """Stores information about a legal research query made by a user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='research_queries')
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='research_queries')
    query_text = models.TextField()
    jurisdiction = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Store results if needed, potentially in a JSONField or separate model
    # results = models.JSONField(blank=True, null=True) 

    def __str__(self):
        if self.case:
            return f"Research for case '{self.case.title}' by {self.user.email} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
        return f"Research by {self.user.email} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Research Queries"

class ResearchResult(models.Model):
    """Stores individual results from a research query."""
    query = models.ForeignKey(ResearchQuery, on_delete=models.CASCADE, related_name='results')
    title = models.CharField(max_length=500)
    excerpt = models.TextField(blank=True)
    source = models.CharField(max_length=200, blank=True)
    url = models.URLField(max_length=1000, blank=True, null=True)
    relevance_score = models.FloatField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-relevance_score', '-added_at']
