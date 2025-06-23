from django.urls import path
from django.views.generic import RedirectView
from rest_framework.authtoken.views import obtain_auth_token
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

    path('api/login/', obtain_auth_token, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/user/', views.api_current_user, name='api_current_user'),
    path('api/employees/', views.api_employees, name='api_employees'),
    path('api/products/', views.api_products, name='api_products'),
    path('api/products/create/', views.api_create_product, name='api_create_product'),
    path('api/products/update/<int:pk>/', views.api_update_product, name='api_update_product'),
    path('api/products/delete/<int:pk>/', views.api_delete_product, name='api_delete_product'),
    path('api/orders/', views.api_orders, name='api_orders'),
    path('api/orders/create/', views.api_create_order, name='api_create_order'),
    path('api/orders/update/<int:pk>/', views.api_update_order, name='api_update_order'),
    path('api/orders/<int:pk>/', views.api_order_details, name='api_order_details'),
    path('api/orders/close/<int:pk>/', views.api_close_order, name='api_close_order'),
]
