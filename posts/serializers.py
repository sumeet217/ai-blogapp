from rest_framework import serializers
from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for post lists (no full body)."""
    tags_list = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'excerpt', 'author', 'tags', 'tags_list',
                  'created_at', 'updated_at', 'reading_time']

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_reading_time(self, obj):
        words = len(obj.body.split())
        minutes = max(1, round(words / 200))
        return f"{minutes} min read"


class PostSerializer(serializers.ModelSerializer):
    """Full serializer for post detail view."""
    tags_list = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'body', 'excerpt', 'author', 'tags',
                  'tags_list', 'created_at', 'updated_at', 'reading_time']

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_reading_time(self, obj):
        words = len(obj.body.split())
        minutes = max(1, round(words / 200))
        return f"{minutes} min read"
