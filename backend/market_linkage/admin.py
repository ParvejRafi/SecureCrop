from django.contrib import admin
from .models import MarketSearch, FavoritePlace, PlaceVisit


@admin.register(MarketSearch)
class MarketSearchAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_results', 'markets_found', 'buyers_found', 'stores_found', 'searched_at']
    list_filter = ['searched_at']
    search_fields = ['user__email']
    date_hierarchy = 'searched_at'


@admin.register(FavoritePlace)
class FavoritePlaceAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'place_type', 'address', 'added_at']
    list_filter = ['place_type', 'added_at']
    search_fields = ['user__email', 'name', 'address']


@admin.register(PlaceVisit)
class PlaceVisitAdmin(admin.ModelAdmin):
    list_display = ['user', 'place_name', 'place_type', 'visited_at']
    list_filter = ['place_type', 'visited_at']
    search_fields = ['user__email', 'place_name']
    date_hierarchy = 'visited_at'
