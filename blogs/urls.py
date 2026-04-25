"""
URL configuration for the AI-Powered Blog project.
- /admin/          → Django admin
- /api/            → REST API (posts, chat, recommendations, search)
- /                → React SPA (served from frontend/dist in production)
"""
from django.contrib import admin
from django.urls import path, include
from django.http import FileResponse
from django.conf import settings
from django.views.static import serve
import os


def serve_react(request, path=''):
    """Serve the React SPA index.html for all non-API routes."""
    react_index = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
    if os.path.exists(react_index):
        return FileResponse(open(react_index, 'rb'), content_type='text/html')
    # Fallback during development (React dev server handles it)
    from django.http import HttpResponse
    return HttpResponse(
        "<h1>React app not built yet.</h1><p>Run: <code>cd frontend && npm run build</code></p>",
        status=200
    )


urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # REST API endpoints
    path('api/', include('posts.urls')),
]

# Catch-all: serve React SPA for any non-API route
from django.urls import re_path
urlpatterns += [
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'frontend' / 'dist' / 'assets'}),
    re_path(r'^(?!api|admin|static|assets).*$', serve_react),
]
