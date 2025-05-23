# Generated by Django 4.2.7 on 2025-05-15 18:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ResearchQuery",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("query_text", models.TextField()),
                (
                    "jurisdiction",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="research_queries",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Research Queries",
                "ordering": ["-timestamp"],
            },
        ),
        migrations.CreateModel(
            name="ResearchResult",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=500)),
                ("excerpt", models.TextField(blank=True)),
                ("source", models.CharField(blank=True, max_length=200)),
                ("url", models.URLField(blank=True, max_length=1000, null=True)),
                ("relevance_score", models.FloatField(blank=True, null=True)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                (
                    "query",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="results",
                        to="research.researchquery",
                    ),
                ),
            ],
            options={
                "ordering": ["-relevance_score", "-added_at"],
            },
        ),
    ]
