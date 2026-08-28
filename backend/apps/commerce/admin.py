from django.contrib import admin

from .models import Address, CartItem, Notification, Order, OrderItem, WishlistItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "display_email", "status", "total", "created_at")
    list_filter = ("status",)
    search_fields = ("order_number", "guest_email", "guest_name")
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "name", "city", "is_default")
    list_filter = ("is_default",)
    search_fields = ("user__email", "name", "city")


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product")
    search_fields = ("user__email", "product__name")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "type", "is_read", "created_at")
    list_filter = ("type", "is_read")
    search_fields = ("user__email", "title")


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "quantity")
    search_fields = ("user__email", "product__name")