from django.contrib import admin

from .models import ContactMessage, LegalDocument, Newsletter, Service, Setting, SiteBlock, SitePage


class ServiceAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "status", "order"]
    list_filter = ["status"]
    search_fields = ["title", "slug"]
    prepopulated_fields = {"slug": ("title",)}


admin.site.register(Service, ServiceAdmin)
admin.site.register(LegalDocument)
admin.site.register(SitePage)
admin.site.register(SiteBlock)
admin.site.register(ContactMessage)
admin.site.register(Newsletter)
admin.site.register(Setting)