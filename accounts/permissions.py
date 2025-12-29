"""
Custom permissions for role-based access control.
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access a view.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsRegularUser(permissions.BasePermission):
    """
    Custom permission to only allow regular users (non-admin) to access a view.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'USER'
