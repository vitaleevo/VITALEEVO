"""Serializers para receção e consulta de analytics."""
import math

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


def validate_path(value: str) -> str:
    path = value.strip()
    if not path.startswith("/") or path.startswith("//"):
        raise serializers.ValidationError("A rota deve ser um caminho local iniciado por '/'.")
    return path


def validate_percent(value: float) -> float:
    if not math.isfinite(value) or value < 0 or value > 100:
        raise serializers.ValidationError("A coordenada deve estar entre 0 e 100.")
    return value


class PageViewInputSerializer(serializers.Serializer):
    referrer = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    device_type = serializers.ChoiceField(
        choices=["desktop", "mobile", "tablet"],
        required=False,
        default="desktop",
    )
    browser = serializers.CharField(max_length=80, required=False, allow_blank=True, default="")
    screen_resolution = serializers.RegexField(
        r"^\d{2,5}x\d{2,5}$",
        max_length=30,
        required=False,
        allow_blank=True,
        default="",
    )


class ClickInputSerializer(serializers.Serializer):
    path = serializers.CharField(max_length=255, required=False, validators=[validate_path])
    element_tag = serializers.CharField(max_length=40, required=False, default="button")
    element_id = serializers.CharField(max_length=120, required=False, allow_blank=True, default="")
    element_text = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    element_selector = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    x_percent = serializers.FloatField(required=False, default=0.0, validators=[validate_percent])
    y_percent = serializers.FloatField(required=False, default=0.0, validators=[validate_percent])
    viewport_width = serializers.IntegerField(min_value=1, max_value=16_384, required=False, default=1920)
    viewport_height = serializers.IntegerField(min_value=1, max_value=16_384, required=False, default=1080)


class TrackBatchSerializer(serializers.Serializer):
    session_id = serializers.CharField(min_length=8, max_length=80)
    path = serializers.CharField(max_length=255, validators=[validate_path])
    pageview = PageViewInputSerializer(required=False, allow_null=True)
    clicks = ClickInputSerializer(many=True, required=False, default=list, max_length=50)

    def validate(self, attrs):
        if not attrs.get("pageview") and not attrs.get("clicks"):
            raise serializers.ValidationError("Envie pageview e/ou clicks.")
        return attrs


class TrackEventSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["pageview", "click"])
    path = serializers.CharField(max_length=255, validators=[validate_path])
    session_id = serializers.CharField(min_length=8, max_length=80)
    referrer = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    device_type = serializers.ChoiceField(
        choices=["desktop", "mobile", "tablet"], required=False, default="desktop"
    )
    browser = serializers.CharField(max_length=80, required=False, allow_blank=True, default="")
    screen_resolution = serializers.RegexField(
        r"^\d{2,5}x\d{2,5}$", max_length=30, required=False, allow_blank=True, default=""
    )
    element_tag = serializers.CharField(max_length=40, required=False, default="button")
    element_id = serializers.CharField(max_length=120, required=False, allow_blank=True, default="")
    element_text = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    element_selector = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    x_percent = serializers.FloatField(required=False, default=0.0, validators=[validate_percent])
    y_percent = serializers.FloatField(required=False, default=0.0, validators=[validate_percent])
    viewport_width = serializers.IntegerField(min_value=1, max_value=16_384, required=False, default=1920)
    viewport_height = serializers.IntegerField(min_value=1, max_value=16_384, required=False, default=1080)
