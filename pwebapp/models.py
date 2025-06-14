from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - R${self.price:.2f}"

class Order(models.Model):
    table_number = models.PositiveSmallIntegerField()
    responsible_name = models.CharField(max_length=255)
    is_paid = models.BooleanField(default=False)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.is_paid:
            closed = self.closed_at.astimezone(timezone.get_current_timezone()).strftime("%d/%m/%Y %H:%M")
            return f"Mesa {self.table_number}: {self.responsible_name} - Pago - Fechado em {closed}"
        else:
            opened = self.opened_at.astimezone(timezone.get_current_timezone()).strftime("%d/%m/%Y %H:%M")
            return f"Mesa {self.table_number}: {self.responsible_name} - Aberto em {opened}"

    def clean(self):
        if not self.is_paid:
            conflict = Order.objects.filter(
                table_number=self.table_number,
                is_paid=False
            )
            if self.pk:
                conflict = conflict.exclude(pk=self.pk)

            if conflict.exists():
                raise ValidationError({'table_number': "There is already an open order for this table."})

    def validate(self, now=None):
        if self.closed_at and self.closed_at < self.opened_at:
            raise ValidationError({
                'closed_at': "The closed_at date cannot be before the opened_at date."
            })
        if self.closed_at and self.closed_at > now:
            raise ValidationError({
                'closed_at': "The closed_at date cannot be in the future."
            })

    def save(self, *args, **kwargs):
        now = timezone.now()
        if self.is_paid and self.closed_at is None:
            self.closed_at = now
        elif not self.is_paid:
            self.closed_at = None

        self.full_clean()
        self.validate(now=now)
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['table_number'],
                condition=Q(is_paid=False),
                name='unique_open_order_per_table'
            )
        ]

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Mesa {self.order.table_number}: {self.order.responsible_name})"
    
    def clean(self):
        if self.quantity <= 0:
            raise ValidationError({
                'quantity': "Quantity must be greater than 0."
            })
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)