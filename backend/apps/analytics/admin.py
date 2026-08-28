from django.contrib import admin
from .models import ClickEvent, PageView


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ["path", "device_type", "session_id", "created_at"]
    list_filter = ["device_type", "created_at"]
    search_fields = ["path", "session_id", "referrer"]


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ["path", "element_text", "element_tag", "x_percent", "y_percent", "created_at"]
    list_filter = ["element_tag", "created_at"]
    search_fields = ["path", "element_text", "element_id", "session_id"]
