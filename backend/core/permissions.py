from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level guard: a user may only touch rows they own.

    Looks for a `user` attribute on the object (directly or one hop away).
    """

    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff_role)
