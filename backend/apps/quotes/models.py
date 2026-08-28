"""Cotações: pedidos, itens, tarefas — espelha convex/schema.ts (quoteRequests, quoteItems, quoteTasks)."""
from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.core.models import BaseModel


class QuoteStatus(models.TextChoices):
    NEW = "new", "Nova"
    QUALIFIED = "qualified", "Qualificada"
    PROPOSAL_SENT = "proposal_sent", "Proposta enviada"
    NEGOTIATING = "negotiating", "Em negociação"
    ACCEPTED = "accepted", "Aceite"
    LOST = "lost", "Perdida"
    CANCELLED = "cancelled", "Cancelada"
    FULFILLED = "fulfilled", "Concluída"


class QuoteTaskStatus(models.TextChoices):
    TODO = "todo", "Por fazer"
    DONE = "done", "Feita"
    CANCELLED = "cancelled", "Cancelada"


class QuoteRequest(BaseModel):
    public_id = models.CharField(max_length=24, unique=True, db_index=True)
    public_access_token_hash = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        editable=False,
    )
    status = models.CharField(max_length=20, choices=QuoteStatus.choices, default=QuoteStatus.NEW, db_index=True)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=120, blank=True)
    message = models.TextField(blank=True)
    source = models.CharField(max_length=40, default="site")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_quotes",
    )
    next_follow_up_at = models.DateTimeField(null=True, blank=True)
    proposal_note = models.TextField(blank=True)
    quoted_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "pedido de cotação"
        verbose_name_plural = "pedidos de cotação"
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["assigned_to", "status"]),
        ]

    def __str__(self):
        return f"{self.public_id} — {self.name} ({self.get_status_display()})"


class QuoteItem(BaseModel):
    quote = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL, related_name="quote_items")
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=60, blank=True)
    image = models.URLField(blank=True)
    quantity = models.PositiveIntegerField()
    quoted_unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta(BaseModel.Meta):
        ordering = ["created_at"]
        verbose_name = "item de cotação"
        verbose_name_plural = "itens de cotação"

    def __str__(self):
        return f"{self.quantity}x {self.name}"


class QuoteTask(BaseModel):
    quote = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="quote_tasks",
    )
    due_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=QuoteTaskStatus.choices, default=QuoteTaskStatus.TODO)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_quote_tasks",
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        ordering = ["due_at", "created_at"]
        verbose_name = "tarefa de cotação"
        verbose_name_plural = "tarefas de cotação"

    def __str__(self):
        return self.title
