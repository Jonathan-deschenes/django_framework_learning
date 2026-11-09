from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    pass


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.SlugField(null=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='children'
    )

    def __str__(self):
        return (f'id: {self.id}, name: {self.name}, slug: {self.slug}')


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return (f'id: {self.id}, name: {self.name}')


class Order(models.Model):
    # Status enum
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.AutoField(primary_key=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    created_at = models.DateTimeField(auto_now_add=True)

    def delete(self, using=..., keep_parents=...):
        return super().delete(using, keep_parents)

    def __str__(self):
        return (f'id: {self.id}, status: {self.status}, created_at: {self.created_at}')


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=1000)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    # Foreign keys
    categories = models.ManyToManyField(
        Category, related_name="products")
    tags = models.ManyToManyField(
        Tag, related_name="products", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'id: {self.id}, name: {self.name}, description: {self.description}, price: {self.price}, stock: {self.stock}, is_active: {self.is_active}, created_at: {self.created_at}')


class Review(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(max_length=1000)
    # Foreign key
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="reviews")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'id: {self.id}, rating: {self.rating}/5, comment: {self.comment}, created_at: {self.created_at}')


class OrderItem(models.Model):
    id = models.AutoField(primary_key=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_items")

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.unit_price = self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return (f'id: {self.id}, quantity: {self.quantity}, unit_price: {self.unit_price}')
