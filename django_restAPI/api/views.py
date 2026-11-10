from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from environs import ValidationError
from rest_framework import generics, filters

from .filters import ProductPriceFilter
from .models import *
from .serializers import *

# Products views


class ProductListCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_class = ProductPriceFilter


class ProductRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "pk"

# Product categories views


class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class CategoryRetrieveupdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'pk'

# Product Tags views


class TagListCreate(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class TagRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'pk'

# Review views


class ReviewListCreate(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ReviewRetrieveUpdateDestroye(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'pk'

# User views


class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserRetrieveUpdatedestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'pk'

# Order views


class OrderListCreate(generics.ListCreateAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user_id=self.kwargs["user_pk"]).prefetch_related("items__product")

    def perform_create(self, serializer):
        user = get_object_or_404(User, pk=self.kwargs["user_pk"])
        serializer.save(user=user)


class OrderRetrieveUpdatedestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user_id=self.kwargs["user_pk"]).prefetch_related("items__product")


class OrderItemMixin:
    serializer_class = OrderItemSerializer

    def get_order(self):
        return get_object_or_404(
            Order, pk=self.kwargs["order_pk"], user_id=self.kwargs["user_pk"]
        )

    def get_queryset(self):
        return (OrderItem.objects
                .filter(order_id=self.kwargs["order_pk"],
                        order__user_id=self.kwargs["user_pk"])
                .select_related("product"))

    def check_order_editable(self, order):
        if order.status != Order.Status.PENDING:
            raise ValidationError(
                "Items can only be modified on a PENDING order.")


class OrderItemListCreate(OrderItemMixin, generics.ListCreateAPIView):
    def perform_create(self, serializer):
        order = self.get_order()
        self.check_order_editable(order)
        serializer.save(order=order)


class OrderItemRetrieveUpdateDestroy(OrderItemMixin, generics.RetrieveUpdateDestroyAPIView):
    def perform_update(self, serializer):
        self.check_order_editable(serializer.instance.order)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_order_editable(instance.order)
        instance.delete()
