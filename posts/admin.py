from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'tags', 'created_at']
    list_filter = ['author', 'created_at']
    search_fields = ['title', 'body', 'tags']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Content', {
            'fields': ('title', 'body', 'excerpt')
        }),
        ('Metadata', {
            'fields': ('author', 'tags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['auto_tag_selected_posts']

    def auto_tag_selected_posts(self, request, queryset):
        """Admin action: AI auto-tag selected posts."""
        from . import ai_utils
        updated = 0
        for post in queryset:
            tags = ai_utils.auto_tag_post(post.title, post.body)
            if tags:
                post.tags = tags
                post.save()
                updated += 1
        self.message_user(request, f"✅ Auto-tagged {updated} post(s) using GROQ AI.")

    auto_tag_selected_posts.short_description = "🤖 Auto-tag with GROQ AI"
