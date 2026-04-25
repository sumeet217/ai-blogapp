from django.urls import path
from . import views

urlpatterns = [
    # Post CRUD
    path('posts/', views.PostListView.as_view(), name='api-post-list'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='api-post-detail'),

    # AI Features
    path('posts/<int:pk>/recommendations/', views.PostRecommendationsView.as_view(), name='api-post-recommendations'),
    path('posts/<int:pk>/autotag/', views.AutoTagView.as_view(), name='api-post-autotag'),
    path('chat/', views.ChatbotView.as_view(), name='api-chatbot'),

    # Search
    path('search/', views.SearchView.as_view(), name='api-search'),
]