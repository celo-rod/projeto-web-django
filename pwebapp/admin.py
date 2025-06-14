from django.contrib import admin
from .models import Product, Order, OrderItem

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    exclude = ('closed_at',)
    list_display = ('table_number', 'responsible_name', 'is_paid', 'opened_at', 'closed_at')
    list_filter = ('is_paid',)
    search_fields = ('table_number', 'responsible_name')
    readonly_fields = ('opened_at',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity')
    list_filter = ('product',)