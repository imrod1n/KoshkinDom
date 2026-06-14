import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0001_initial'),
        ('communities', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='community',
            name='conversation',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='community',
                to='messaging.conversation',
            ),
        ),
    ]
