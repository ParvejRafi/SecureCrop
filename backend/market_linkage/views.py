"""
Market Linkage API Views
Find nearby markets, buyers, and agricultural stores using OpenStreetMap Overpass API
Returns REAL data from OpenStreetMap for the user's actual location
"""
import math
import hashlib
import requests
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


# Cache timeout in seconds (10 minutes)
CACHE_TIMEOUT = 600


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in km"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(float(lat1))
    lat2_rad = math.radians(float(lat2))
    delta_lat = math.radians(float(lat2) - float(lat1))
    delta_lon = math.radians(float(lon2) - float(lon1))
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def classify_place(tags):
    """Classify a place as market, buyer, or agri_store based on OSM tags"""
    shop = tags.get('shop', '')
    amenity = tags.get('amenity', '')
    building = tags.get('building', '')
    
    # Markets
    if shop in ['supermarket', 'convenience', 'greengrocer', 'farm', 'butcher', 'seafood']:
        return 'market'
    if amenity in ['marketplace', 'fast_food', 'cafe']:
        return 'market'
    
    # Agricultural Stores
    if shop in ['garden_centre', 'agrarian', 'hardware', 'doityourself', 'trade']:
        return 'agri_store'
    
    # Buyers/Wholesale
    if shop in ['wholesale']:
        return 'buyer'
    if building in ['warehouse', 'industrial']:
        return 'buyer'
    
    # Default based on name patterns
    name = tags.get('name', '').lower()
    if any(w in name for w in ['pasar', 'market', 'mart', 'kedai', 'store', 'shop']):
        return 'market'
    if any(w in name for w in ['tani', 'agro', 'pertanian', 'baja', 'benih', 'garden']):
        return 'agri_store'
    if any(w in name for w in ['borong', 'wholesale', 'warehouse']):
        return 'buyer'
    
    return 'market'  # Default


def get_cache_key(lat, lon, radius):
    """Generate a cache key based on rounded location and radius"""
    # Round to 2 decimal places (~1km precision) to improve cache hits
    rounded_lat = round(lat, 2)
    rounded_lon = round(lon, 2)
    key_string = f"market_search_{rounded_lat}_{rounded_lon}_{radius}"
    return hashlib.md5(key_string.encode()).hexdigest()


class SearchAllView(APIView):
    """Search all nearby places (markets, buyers, stores) using OpenStreetMap"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        lat = float(request.query_params.get('lat', 3.1390))
        lon = float(request.query_params.get('lon', 101.6869))
        radius = int(request.query_params.get('radius', 10000))  # meters
        
        # Check cache first
        cache_key = get_cache_key(lat, lon, radius)
        cached_results = cache.get(cache_key)
        
        if cached_results is not None:
            print(f"[Market Search] Cache HIT for {cache_key}")
            # Recalculate distances from actual position (not rounded)
            for result in cached_results:
                result['distance_km'] = round(
                    haversine_distance(lat, lon, result['lat'], result['lon']), 2
                )
            cached_results.sort(key=lambda x: x.get('distance_km', float('inf')))
            return Response(cached_results)
        
        print(f"[Market Search] Cache MISS - fetching from API")
        
        # Calculate timeout based on radius - larger areas need more time
        # Reduced timeouts since we have fallback servers
        api_timeout = max(20, 15 + (radius // 10000) * 5)
        
        # Single comprehensive query for all relevant place types
        query = f"""
        [out:json][timeout:{api_timeout}];
        (
            node["shop"~"supermarket|convenience|greengrocer|farm|garden_centre|hardware|wholesale"](around:{radius},{lat},{lon});
            node["amenity"="marketplace"](around:{radius},{lat},{lon});
            way["shop"~"supermarket|convenience|greengrocer|farm|garden_centre|hardware|wholesale"](around:{radius},{lat},{lon});
            way["amenity"="marketplace"](around:{radius},{lat},{lon});
        );
        out center tags;
        """
        
        results = []
        
        # List of Overpass API servers to try (fallback if one fails)
        overpass_servers = [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        ]
        
        for server_url in overpass_servers:
            try:
                print(f"[Market Search] Trying {server_url} with radius={radius}m, timeout={api_timeout}s")
                
                response = requests.get(
                    server_url,
                    params={'data': query},
                    timeout=api_timeout + 5,
                    headers={'User-Agent': 'SecureCropSystem/1.0'}
                )
                
                print(f"[Market Search] Response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    elements = data.get('elements', [])
                    print(f"[Market Search] Found {len(elements)} elements from OSM")
                    
                    for element in elements:
                        tags = element.get('tags', {})
                        
                        # Get name - skip if no name
                        name = tags.get('name', tags.get('name:en', tags.get('name:ms', '')))
                        if not name:
                            continue
                        
                        # Get coordinates
                        if element['type'] == 'node':
                            elem_lat = element.get('lat')
                            elem_lon = element.get('lon')
                        elif 'center' in element:
                            elem_lat = element['center'].get('lat')
                            elem_lon = element['center'].get('lon')
                        else:
                            continue
                        
                        if not elem_lat or not elem_lon:
                            continue
                        
                        distance = haversine_distance(lat, lon, elem_lat, elem_lon)
                        
                        # Classify the place type
                        place_type = classify_place(tags)
                        
                        # Build address
                        address_parts = []
                        if tags.get('addr:street'):
                            if tags.get('addr:housenumber'):
                                address_parts.append(f"{tags.get('addr:housenumber')} {tags.get('addr:street')}")
                            else:
                                address_parts.append(tags.get('addr:street'))
                        if tags.get('addr:city'):
                            address_parts.append(tags.get('addr:city'))
                        if tags.get('addr:postcode'):
                            address_parts.append(tags.get('addr:postcode'))
                        
                        address = ', '.join(address_parts) if address_parts else tags.get('addr:full', '')
                        
                        results.append({
                            'id': f"osm_{element['type']}_{element['id']}",
                            'name': name,
                            'lat': elem_lat,
                            'lon': elem_lon,
                            'type': place_type,
                            'distance_km': round(distance, 2),
                            'address': address,
                            'phone': tags.get('phone', tags.get('contact:phone', '')),
                            'opening_hours': tags.get('opening_hours', ''),
                            'website': tags.get('website', tags.get('contact:website', '')),
                            'rating': None,
                            'source': 'openstreetmap'
                        })
                    
                    # Successfully got results, break out of server loop
                    break
                    
                elif response.status_code == 429:
                    print(f"[Market Search] Rate limited by {server_url}, trying next server...")
                    continue
                elif response.status_code == 504:
                    print(f"[Market Search] Gateway timeout from {server_url}, trying next server...")
                    continue
                else:
                    print(f"[Market Search] Unexpected status {response.status_code} from {server_url}")
                    continue
                    
            except requests.exceptions.Timeout:
                print(f"[Market Search] Timeout from {server_url}, trying next server...")
                continue
            except Exception as e:
                print(f"[Market Search] Error from {server_url}: {e}")
                continue
        
        # Sort by distance
        results.sort(key=lambda x: x.get('distance_km', float('inf')))
        
        # Cache the results for future requests
        if results:
            cache.set(cache_key, results, CACHE_TIMEOUT)
            print(f"[Market Search] Cached {len(results)} results for {CACHE_TIMEOUT}s")
        
        return Response(results)


class SearchMarketsView(APIView):
    """Search only markets"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        view = SearchAllView()
        all_results = view.get(request).data
        return Response([r for r in all_results if r.get('type') == 'market'])


class SearchBuyersView(APIView):
    """Search only buyers"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        view = SearchAllView()
        all_results = view.get(request).data
        return Response([r for r in all_results if r.get('type') == 'buyer'])


class SearchStoresView(APIView):
    """Search only agricultural stores"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        view = SearchAllView()
        all_results = view.get(request).data
        return Response([r for r in all_results if r.get('type') == 'agri_store'])
