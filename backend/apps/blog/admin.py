from django.contrib import admin

from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "is_featured", "published_at")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "slug", "author")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_at"