from django.contrib import admin

from .models import QuoteItem, QuoteRequest, QuoteTask


class QuoteItemInline(admin.TabularInline):
    model = QuoteItem
    extra = 0


class QuoteTaskInline(admin.TabularInline):
    model = QuoteTask
    extra = 0


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ["public_id", "name", "email", "status", "source", "created_at"]
    list_filter = ["status", "source"]
    search_fields = ["public_id", "name", "email", "phone", "company"]
    readonly_fields = ["public_id", "created_at", "updated_at"]
    inlines = [QuoteItemInline, QuoteTaskInline]


admin.site.register(QuoteItem)
admin.site.register(QuoteTask)