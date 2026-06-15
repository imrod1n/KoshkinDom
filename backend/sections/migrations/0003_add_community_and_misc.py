from django.db import migrations, models
import django.db.models.deletion


def create_misc_section(apps, schema_editor):
    Section = apps.get_model('sections', 'Section')
    Section.objects.get_or_create(
        category='misc',
        defaults={
            'title': 'Разное',
            'description': 'Статьи на разные темы для владельцев питомцев.',
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0002_article_description'),
        ('communities', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='community',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='articles',
                to='communities.community',
            ),
        ),
        migrations.RunPython(create_misc_section, reverse_code=migrations.RunPython.noop),
    ]
