from __future__ import unicode_literals
from uuid import uuid4
from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.postgres.fields import JSONField


class Geospace(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        db_table = 'geospaces'

    def __str__(self):
        return str(self.latitude) + ',' + str(self.longitude)


class Battalion(models.Model):
    name = models.CharField(max_length=250, verbose_name='Name of Battalion')
    geospace = models.OneToOneField('Geospace', on_delete=models.CASCADE)
    uuid = models.UUIDField(primary_key=True, default=uuid4)
    slug = models.SlugField(null=True, editable=False)

    class Meta:
        db_table = 'battalions'

    def __str__(self):
        return self.name

    def save(self, *args):
        self.slug = slugify(self.name)
        super(Battalion, self).save(*args)


class Post(models.Model):
    name = models.CharField(max_length=250, verbose_name='name of post')
    geospace = models.OneToOneField('Geospace', on_delete=models.CASCADE)
    battalion = models.ForeignKey('Battalion', related_name='posts', on_delete=models.CASCADE, null=True)
    uuid = models.UUIDField(primary_key=True, default=uuid4)
    slug = models.SlugField(null=True, editable=False)

    class Meta:
        db_table = 'posts'

    def __str__(self):
        return self.name

    def save(self, *args):
        self.slug = slugify(self.name)
        super(Post, self).save(*args)


class Morcha(models.Model):
    name = models.CharField(max_length=250, verbose_name='name of morcha')
    geospace = models.OneToOneField('Geospace', on_delete=models.CASCADE)
    post = models.ForeignKey('Post', related_name='morchas', on_delete=models.CASCADE)
    uuid = models.UUIDField(primary_key=True, default=uuid4)
    address = models.CharField(null=True, blank=True, max_length=16)
    slug = models.SlugField(null=True, editable=False)

    class Meta:
        db_table = 'morchas'

    def __str__(self):
        return self.name + ":" + str(self.uuid)

    def save(self, *args):
        self.slug = slugify(self.name)
        super(Morcha, self).save(*args)


class Device(models.Model):
    DEVICE_TYPES = (
        ('unit', 'unit'),
    )
    uuid = models.UUIDField(primary_key=True, default=uuid4)
    morcha = models.ForeignKey('Morcha', on_delete=models.CASCADE, null=True, related_name='devices')
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES)

    class Meta:
        db_table = 'devices'

    def __str__(self):
        return str(self.morcha)



class Event(models.Model):
    id = models.BigAutoField(primary_key=True)
    req_datetime = models.DateTimeField(auto_now=True)
    uuid = models.UUIDField()
    packet_type = models.IntegerField()
    source_addr = models.BigIntegerField()
    dest_addr = models.BigIntegerField()
    payload = JSONField()

    class Meta:
        db_table = 'events'

    def __str__(self):
        return str(self.packet_type)


class Intrusion(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    morcha = models.ForeignKey('Morcha', on_delete=models.CASCADE)
    ignore = models.BooleanField(default=False)
    attempts = models.IntegerField()

    class Meta:
        db_table = 'intrusion'

    def __str__(self):
        return str(self.morcha.name) + ":" + str(self.attempts)