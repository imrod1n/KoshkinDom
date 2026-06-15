from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_alter_like_options_alter_like_post'),
        ('communities', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='community',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='posts',
                to='communities.community',
            ),
        ),
    ]
