from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "is_featured", "order")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "slug", "client")
    prepopulated_fields = {"slug": ("title",)}