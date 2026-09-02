from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_add_provider_apikey'),
    ]

    operations = [
        migrations.AlterField(
            model_name='provider',
            name='logo',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
    ]