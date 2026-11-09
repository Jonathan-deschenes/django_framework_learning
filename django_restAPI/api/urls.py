from django.urls import path
from . import views

urlpatterns = [
    # Products objects routes
    path("product/", views.ProductListCreate.as_view(),
         name="Product-list-create-view"),
    path("product/<int:pk>/", views.ProductRetrieveUpdateDestroy.as_view(),
         name="Product-update-destroy-view"),

    # Categories objects routes
    path("category/", views.CategoryListCreate.as_view(),
         name="Category-list-create-view"),
    path("category/<int:pk>", views.CategoryRetrieveupdateDestroy.as_view(),
         name="Category-update-destroy-view"),

    # Tags objects routes
    path("tag/", views.TagListCreate.as_view(),
         name="Tag-list-create-view"),
    path("tag/<int:pk>/", views.TagRetrieveUpdateDestroy.as_view(),
         name="Tag-update-destroy-view"),

    # Reviews objects routes
    path("review/",
         views.ReviewListCreate.as_view(), name="Review-list-create-view"),
    path("review/<int:pk>",
         views.ReviewRetrieveUpdateDestroye.as_view(), name="Review-update-destroy-view"),

    # User objects routes
    path("user/", views.UserListCreate.as_view(), name="User-list-create-view"),
    path("user/<int:pk>/", views.UserRetrieveUpdatedestroy.as_view(),
         name="User-update-destroy-view"),

    # Order objects routes
    path("user/<int:user_pk>/order/", views.OrderListCreate.as_view(),
         name="Order-list-create-view"),
    path("user/<int:user_pk>/order/<int:pk>/", views.OrderRetrieveUpdatedestroy.as_view(),
         name="Order-update-destroy-view"),

    # Order Item objects routes
    path("user/<int:user_pk>/order/<int:order_pk>/item/",
         views.OrderItemListCreate.as_view(), name="order-item-list-create"),
    path("user/<int:user_pk>/order/<int:order_pk>/item/<int:pk>/",
         views.OrderItemRetrieveUpdateDestroy.as_view(), name="order-item-detail"),
]
