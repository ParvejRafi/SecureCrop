"""
Market Linkage Models
Store market search history and favorite places for farmers
"""
from django.db import models
from django.conf import settings


class MarketSearch(models.Model):
    """Store market search history for farmers"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='market_searches'
    )
    
    # Search location
    search_latitude = models.FloatField()
    search_longitude = models.FloatField()
    search_radius = models.IntegerField(default=10000)  # in meters
    
    # Search results count
    markets_found = models.IntegerField(default=0)
    buyers_found = models.IntegerField(default=0)
    stores_found = models.IntegerField(default=0)
    total_results = models.IntegerField(default=0)
    
    # Timestamp
    searched_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-searched_at']
        verbose_name = 'Market Search'
        verbose_name_plural = 'Market Searches'
    
    def __str__(self):
        return f"{self.user.email} - {self.total_results} results on {self.searched_at}"


class FavoritePlace(models.Model):
    """Store farmer's favorite markets, buyers, and stores"""
    PLACE_TYPES = [
        ('market', 'Market'),
        ('buyer', 'Buyer'),
        ('agri_store', 'Agricultural Store'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorite_places'
    )
    
    # Place details
    place_id = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    place_type = models.CharField(max_length=20, choices=PLACE_TYPES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=500, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    rating = models.FloatField(null=True, blank=True)
    
    # Notes from farmer
    notes = models.TextField(blank=True)
    
    # Timestamps
    added_at = models.DateTimeField(auto_now_add=True)
    last_visited = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ['user', 'place_id']
        verbose_name = 'Favorite Place'
        verbose_name_plural = 'Favorite Places'
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"


class PlaceVisit(models.Model):
    """Track farmer visits to markets and stores"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='place_visits'
    )
    
    place_id = models.CharField(max_length=100)
    place_name = models.CharField(max_length=200)
    place_type = models.CharField(max_length=20)
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Visit details
    visited_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-visited_at']
        verbose_name = 'Place Visit'
        verbose_name_plural = 'Place Visits'
    
    def __str__(self):
        return f"{self.user.email} visited {self.place_name}"
