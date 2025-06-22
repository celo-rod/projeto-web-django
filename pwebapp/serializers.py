from django.contrib.auth.models import User
from .models import Product, Order
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
  full_name = serializers.SerializerMethodField()

  class Meta:
    model = User
    fields = ['id', 'username', 'full_name', 'email', 'is_staff', 'is_superuser']

  def get_full_name(self, obj):
    return obj.get_full_name()

class ProductSerializer(serializers.ModelSerializer):
  class Meta:
    model = Product
    fields = ['id', 'name', 'description', 'price']

class OrderSerializer(serializers.ModelSerializer):
  class Meta:
    model = Order
    fields = ['id', 'table_number', 'responsible_name', 'is_paid', 'opened_at', 'closed_at']