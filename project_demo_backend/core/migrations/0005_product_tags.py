# Generated by Django 5.1 on 2024-08-15 14:19

import taggit.managers
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_product_life_product_mfd_product_stock_count_and_more'),
        ('taggit', '0006_rename_taggeditem_content_type_object_id_taggit_tagg_content_8fc721_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='tags',
            field=taggit.managers.TaggableManager(blank=True, help_text='A comma-separated list of tags.', through='taggit.TaggedItem', to='taggit.Tag', verbose_name='Tags'),
        ),
    ]
