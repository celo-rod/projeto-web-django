from django.urls import path
from . import views

urlpatterns = [
    path('employees', views.employees, name='employees'),
    path('products', views.products, name='list_products'),
    path('products/create/', views.create_product, name='create_product'),
    path('products/update/<int:pk>/', views.update_product, name='update_product'),
    path('products/delete/<int:pk>/', views.delete_product, name='delete_product'),
    path('orders', views.orders, name='list_orders'),
    path('orders/create/', views.create_order, name='create_order'),
]
