from django.db import models
from django.utils import timezone


class Post(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True, default='')
    author = models.CharField(max_length=100, blank=True, default='Sumeet')
    tags = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text='Comma-separated tags (e.g. python,django,web)'
    )
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_tags_list(self):
        """Return tags as a Python list."""
        if self.tags:
            return [t.strip() for t in self.tags.split(',') if t.strip()]
        return []

    def save(self, *args, **kwargs):
        # Auto-generate excerpt from body if not provided
        if not self.excerpt and self.body:
            self.excerpt = self.body[:250].rstrip() + ('…' if len(self.body) > 250 else '')
        super().save(*args, **kwargs)
