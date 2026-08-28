from django.contrib import admin

from .models import Brand, Category, InventoryMovement, Product


class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "price", "stock", "status", "is_active"]
    list_filter = ["status", "category", "brand", "is_active"]
    search_fields = ["name", "sku", "slug"]
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Product, ProductAdmin)
admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(InventoryMovement)