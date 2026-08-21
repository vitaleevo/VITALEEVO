"""Serializers para receção e consulta de analytics."""
from rest_framework import serializers
from .models import ClickEvent, PageView


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = [
            "id", "path", "session_id", "referrer", "device_type",
            "browser", "screen_resolution", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ClickEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClickEvent
        fields = [
            "id", "path", "session_id", "element_tag", "element_id",
            "element_text", "element_selector", "x_percent", "y_percent",
            "viewport_width", "viewport_height", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class TrackBatchSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=80)
    path = serializers.CharField(max_length=255)
    pageview = serializers.DictField(required=False)
    clicks = serializers.ListField(child=serializers.DictField(), required=False, default=list)
