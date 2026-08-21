"""Endpoints para ingestão de eventos e agregação de dados analíticos / mapa de calor."""
from datetime import timedelta
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasAnyCapability
from .models import ClickEvent, PageView
from .serializers import TrackBatchSerializer


def get_date_filter(period: str):
    now = timezone.now()
    if period == "today":
        return Q(created_at__gte=now.replace(hour=0, minute=0, second=0, microsecond=0))
    elif period == "7d":
        return Q(created_at__gte=now - timedelta(days=7))
    elif period == "30d":
        return Q(created_at__gte=now - timedelta(days=30))
    return Q()


class AnalyticsTrackView(APIView):
    """Endpoint público para ingestão leve e assíncrona de eventos analíticos."""

    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        user = request.user if request.user.is_authenticated else None

        # 1. Suporte a payload estruturado em lote (batch)
        if "session_id" in data and ("pageview" in data or "clicks" in data):
            session_id = str(data.get("session_id", ""))[:80]
            path = str(data.get("path", "/"))[:255]

            # Inserir PageView se enviado
            if "pageview" in data and data["pageview"]:
                pv_data = data["pageview"]
                PageView.objects.create(
                    path=path,
                    session_id=session_id,
                    referrer=str(pv_data.get("referrer", ""))[:500],
                    device_type=str(pv_data.get("device_type", "desktop"))[:20],
                    browser=str(pv_data.get("browser", ""))[:80],
                    screen_resolution=str(pv_data.get("screen_resolution", ""))[:30],
                    user=user,
                )

            # Inserir múltiplos cliques em lote
            clicks = data.get("clicks", [])
            click_objs = []
            for c in clicks:
                if not isinstance(c, dict):
                    continue
                click_objs.append(
                    ClickEvent(
                        path=str(c.get("path", path))[:255],
                        session_id=session_id,
                        element_tag=str(c.get("element_tag", "button"))[:40],
                        element_id=str(c.get("element_id", ""))[:120],
                        element_text=str(c.get("element_text", ""))[:255],
                        element_selector=str(c.get("element_selector", ""))[:255],
                        x_percent=float(c.get("x_percent", 0.0) or 0.0),
                        y_percent=float(c.get("y_percent", 0.0) or 0.0),
                        viewport_width=int(c.get("viewport_width", 1920) or 1920),
                        viewport_height=int(c.get("viewport_height", 1080) or 1080),
                    )
                )
            if click_objs:
                ClickEvent.objects.bulk_create(click_objs)

            return Response({"ok": True, "tracked": {"pageview": bool(data.get("pageview")), "clicks": len(click_objs)}})

        # 2. Suporte a evento único: type = "pageview" ou "click"
        event_type = data.get("type", "pageview")
        path = str(data.get("path", "/"))[:255]
        session_id = str(data.get("session_id", "anon"))[:80]

        if event_type == "pageview":
            PageView.objects.create(
                path=path,
                session_id=session_id,
                referrer=str(data.get("referrer", ""))[:500],
                device_type=str(data.get("device_type", "desktop"))[:20],
                browser=str(data.get("browser", ""))[:80],
                screen_resolution=str(data.get("screen_resolution", ""))[:30],
                user=user,
            )
        elif event_type == "click":
            ClickEvent.objects.create(
                path=path,
                session_id=session_id,
                element_tag=str(data.get("element_tag", "button"))[:40],
                element_id=str(data.get("element_id", ""))[:120],
                element_text=str(data.get("element_text", ""))[:255],
                element_selector=str(data.get("element_selector", ""))[:255],
                x_percent=float(data.get("x_percent", 0.0) or 0.0),
                y_percent=float(data.get("y_percent", 0.0) or 0.0),
                viewport_width=int(data.get("viewport_width", 1920) or 1920),
                viewport_height=int(data.get("viewport_height", 1080) or 1080),
            )

        return Response({"ok": True})


class AnalyticsOverviewView(APIView):
    """Métricas globais de audiência, ranking de páginas e botões mais clicados."""

    def get_permissions(self):
        if self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or getattr(self.request.user, "is_superuser", False)):
            # staff sem capacidade específica ainda precisa passar pela verificação abaixo; superuser/admin já tem acesso
            if self.request.user.is_superuser or getattr(self.request.user, "role", None) == "admin":
                return []
            return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]
        return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]

    def get(self, request):
        period = request.query_params.get("period", "30d")
        date_q = get_date_filter(period)

        pv_qs = PageView.objects.filter(date_q)
        click_qs = ClickEvent.objects.filter(date_q)

        total_pvs = pv_qs.count()
        unique_sessions = pv_qs.values("session_id").distinct().count()
        total_clicks = click_qs.count()
        interaction_rate = round((total_clicks / total_pvs * 100), 1) if total_pvs > 0 else 0.0

        # Dispositivos
        devices = {
            "desktop": pv_qs.filter(device_type="desktop").count(),
            "mobile": pv_qs.filter(device_type="mobile").count(),
            "tablet": pv_qs.filter(device_type="tablet").count(),
        }

        # Páginas mais visitadas
        top_pages_raw = pv_qs.values("path").annotate(
            visits=Count("id"),
            unique_visitors=Count("session_id", distinct=True)
        ).order_by("-visits")[:10]

        top_pages = []
        for p in top_pages_raw:
            path_clicks = click_qs.filter(path=p["path"]).count()
            top_pages.append({
                "path": p["path"],
                "visits": p["visits"],
                "unique_visitors": p["unique_visitors"],
                "clicks": path_clicks,
                "interaction_rate": round((path_clicks / p["visits"] * 100), 1) if p["visits"] > 0 else 0.0,
            })

        # Ranking dos botões e elementos mais clicados no site
        top_buttons_raw = click_qs.exclude(element_text="").values("element_text", "element_tag", "path").annotate(
            clicks=Count("id")
        ).order_by("-clicks")[:15]

        top_buttons = []
        for b in top_buttons_raw:
            top_buttons.append({
                "text": b["element_text"],
                "tag": b["element_tag"],
                "path": b["path"],
                "clicks": b["clicks"],
                "percentage": round((b["clicks"] / total_clicks * 100), 1) if total_clicks > 0 else 0.0,
            })

        return Response({
            "period": period,
            "total_pageviews": total_pvs,
            "unique_visitors": unique_sessions,
            "total_clicks": total_clicks,
            "interaction_rate": interaction_rate,
            "devices": devices,
            "top_pages": top_pages,
            "top_buttons": top_buttons,
        })


class AnalyticsHeatmapView(APIView):
    """Retorna a nuvem de coordenadas de cliques e ranking de elementos para uma rota específica."""

    def get_permissions(self):
        if self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or getattr(self.request.user, "is_superuser", False)):
            if self.request.user.is_superuser or getattr(self.request.user, "role", None) == "admin":
                return []
            return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]
        return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]

    def get(self, request):
        path = request.query_params.get("path", "/")
        period = request.query_params.get("period", "30d")
        date_q = get_date_filter(period)

        clicks = ClickEvent.objects.filter(date_q, path=path)
        pvs = PageView.objects.filter(date_q, path=path)

        total_clicks = clicks.count()
        total_views = pvs.count()
        unique_visitors = pvs.values("session_id").distinct().count()

        # Agrupar pontos de calor por coordenadas percentuais (grau de resolução 0.5% ou 1.0%)
        # Para desenhar o heatmap visual
        points_raw = clicks.values("x_percent", "y_percent", "element_tag", "element_text")
        point_clusters = {}
        for pt in points_raw:
            # arredondar para criar aglomerados visuais de calor
            rx = round(pt["x_percent"], 1)
            ry = round(pt["y_percent"], 1)
            key = f"{rx},{ry}"
            if key not in point_clusters:
                point_clusters[key] = {
                    "x": rx,
                    "y": ry,
                    "count": 0,
                    "tag": pt["element_tag"],
                    "text": pt["element_text"] or pt["element_tag"],
                }
            point_clusters[key]["count"] += 1

        points = list(point_clusters.values())
        points.sort(key=lambda p: p["count"], reverse=True)

        # Ranking dos elementos mais clicados desta página
        elements_raw = clicks.values("element_text", "element_tag", "element_id").annotate(
            clicks=Count("id")
        ).order_by("-clicks")[:20]

        elements = []
        for el in elements_raw:
            label = el["element_text"] or el["element_id"] or f"<{el['element_tag']}>"
            elements.append({
                "label": label,
                "tag": el["element_tag"],
                "element_id": el["element_id"],
                "clicks": el["clicks"],
                "percentage": round((el["clicks"] / total_clicks * 100), 1) if total_clicks > 0 else 0.0,
            })

        return Response({
            "path": path,
            "period": period,
            "total_pageviews": total_views,
            "unique_visitors": unique_visitors,
            "total_clicks": total_clicks,
            "points": points[:500],
            "elements": elements,
        })


class AnalyticsPagesListView(APIView):
    """Lista de todas as rotas com tráfego registado para o seletor do Mapa de Calor."""

    def get_permissions(self):
        if self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or getattr(self.request.user, "is_superuser", False)):
            if self.request.user.is_superuser or getattr(self.request.user, "role", None) == "admin":
                return []
            return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]
        return [HasAnyCapability("audit:read", "settings:manage", "content:manage")]

    def get(self, request):
        pages = PageView.objects.values("path").annotate(
            views=Count("id"),
            unique_sessions=Count("session_id", distinct=True)
        ).order_by("-views")

        result = []
        for p in pages:
            clicks_count = ClickEvent.objects.filter(path=p["path"]).count()
            result.append({
                "path": p["path"],
                "views": p["views"],
                "unique_sessions": p["unique_sessions"],
                "clicks": clicks_count,
            })

        # Se vazio, fornecer ao menos rotas padrão para pré-visualização
        if not result:
            result = [
                {"path": "/", "views": 0, "unique_sessions": 0, "clicks": 0},
                {"path": "/store", "views": 0, "unique_sessions": 0, "clicks": 0},
                {"path": "/services", "views": 0, "unique_sessions": 0, "clicks": 0},
                {"path": "/portfolio", "views": 0, "unique_sessions": 0, "clicks": 0},
                {"path": "/blog", "views": 0, "unique_sessions": 0, "clicks": 0},
                {"path": "/contact", "views": 0, "unique_sessions": 0, "clicks": 0},
            ]

        return Response(result)
