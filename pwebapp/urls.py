from django.urls import path
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='list_orders', permanent=False)),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('employees', views.employees, name='employees'),
    path('products', views.products, name='list_products'),
    path('products/create/', views.create_product, name='create_product'),
    path('products/update/<int:pk>/', views.update_product, name='update_product'),
    path('products/delete/<int:pk>/', views.delete_product, name='delete_product'),
    path('orders', views.orders, name='list_orders'),
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/<int:pk>/', views.order_details, name='order_details'),
    path('orders/update/<int:pk>/', views.update_order, name='update_order'),
    path('orders/close/<int:pk>/', views.close_order, name='close_order'),
]
