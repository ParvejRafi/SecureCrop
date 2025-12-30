"""
Views for serving the frontend application
"""
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator


@method_decorator(never_cache, name='dispatch')
class IndexView(TemplateView):
    """
    Serve the React frontend index.html
    This handles all routes for React Router
    """
    template_name = 'index.html'
