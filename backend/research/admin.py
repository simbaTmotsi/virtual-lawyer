from django.contrib import admin
from .models import ResearchQuery, ResearchResult

class ResearchResultInline(admin.TabularInline):
    model = ResearchResult
    extra = 0
    readonly_fields = ['title', 'excerpt', 'source', 'url', 'relevance_score', 'added_at'] # Changed 'created_at' to 'added_at' to match model
    
    # Optional: to make the link clickable if you have a view for individual results
    # fields = ['title', 'excerpt', 'source', 'url_link', 'relevance_score', 'created_at'] 
    # from django.utils.html import format_html
    # def url_link(self, obj):
    #     if obj.url:
    #         return format_html("<a href='{url}' target='_blank'>{url}</a>", url=obj.url)
    #     return "-"
    # url_link.short_description = "URL"

@admin.register(ResearchQuery)
class ResearchQueryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'query_text', 'jurisdiction', 'timestamp', 'result_count']
    list_filter = ['timestamp', 'jurisdiction', 'user']
    search_fields = ['query_text', 'user__email', 'user__username']
    readonly_fields = ['timestamp']
    inlines = [ResearchResultInline]
    
    def result_count(self, obj):
        return obj.results.count() # 'results' is the related_name in ResearchResult model
    result_count.short_description = 'Results'

@admin.register(ResearchResult)
class ResearchResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'query_link', 'title', 'source', 'relevance_score', 'added_at'] # Changed 'created_at' to 'added_at'
    list_filter = ['added_at', 'source', 'relevance_score'] # Changed 'created_at' to 'added_at'
    search_fields = ['title', 'excerpt', 'source', 'query__query_text']
    readonly_fields = ['added_at'] # Changed 'created_at' to 'added_at'

    # Optional: Make query field clickable to navigate to the ResearchQuery in admin
    def query_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        link = reverse("admin:research_researchquery_change", args=[obj.query.id])
        return format_html('<a href="{}">{}</a>', link, obj.query)
    query_link.short_description = 'Query'
