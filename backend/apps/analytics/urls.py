"""Roteamento da API de Analytics e Mapa de Calor."""
from django.urls import path
from .views import (
    AnalyticsHeatmapView,
    AnalyticsOverviewView,
    AnalyticsPagesListView,
    AnalyticsTrackView,
)

urlpatterns = [
    path("analytics/track/", AnalyticsTrackView.as_view(), name="analytics-track"),
    path("analytics/overview/", AnalyticsOverviewView.as_view(), name="analytics-overview"),
    path("analytics/heatmap/", AnalyticsHeatmapView.as_view(), name="analytics-heatmap"),
    path("analytics/pages/", AnalyticsPagesListView.as_view(), name="analytics-pages"),
]
