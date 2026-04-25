# Migration to switch created_at default from datetime.datetime.now
# (timezone-naive) to django.utils.timezone.now (timezone-aware).
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0002_alter_post_options_post_author_post_excerpt_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='created_at',
            field=models.DateTimeField(
                blank=True,
                default=django.utils.timezone.now,
            ),
        ),
    ]
