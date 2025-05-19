from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from localflavor.br.models import BRCPFField

class Person(models.Model):
    cpf = BRCPFField(unique=True)
    gender = models.CharField(max_length=1, choices=[
        ('M', 'Male'),
        ('F', 'Female'),
    ])

class User(AbstractUser):
    person = models.OneToOneField(Person, on_delete=models.CASCADE, null=True, blank=True)

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

class Order(models.Model):
    table_number = models.PositiveSmallIntegerField()
    is_paid = models.BooleanField(default=False)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def validate(self):
        if self.closed_at and self.closed_at < self.opened_at:
            raise ValidationError({
                'closed_at': "The closed_at date cannot be before the opened_at date."
            })
        
    def save(self, *args, **kwargs):
        self.validate()
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField()