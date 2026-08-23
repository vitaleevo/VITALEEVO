"""Catálogo: categorias, marcas, produtos e movimentos de stock.

Espelha convex/schema.ts (products, categories, brands, inventoryMovements).
"""
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower

from apps.core.models import BaseModel
from apps.core.validators import validate_slug


class ProductStatus(models.TextChoices):
    DRAFT = "draft", "Rascunho"
    PUBLISHED = "published", "Publicado"
    ARCHIVED = "archived", "Arquivado"


class Category(BaseModel):
    name = models.CharField(max_length=120)
    slug = models.CharField(max_length=140, unique=True, validators=[validate_slug])
    type = models.CharField(
        max_length=20,
        choices=[("store", "Loja"), ("blog", "Blog"), ("portfolio", "Portfólio")],
        default="store",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name="categoria pai",
    )
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        verbose_name = "categoria"
        verbose_name_plural = "categorias"
        constraints = [
            models.UniqueConstraint(fields=["parent", "name"], name="unique_child_name_per_parent"),
            models.CheckConstraint(
                condition=~models.Q(id=models.F("parent_id")),
                name="category_cannot_parent_itself",
            ),
        ]

    def clean(self):
        super().clean()
        if not self.parent_id:
            return
        if self.parent_id == self.id:
            raise ValidationError({"parent": "Uma categoria não pode ser pai de si própria."})
        if self.parent and self.parent.type != self.type:
            raise ValidationError({"parent": "A categoria pai deve ter o mesmo tipo."})

        ancestor = self.parent
        visited = {self.id}
        while ancestor is not None:
            if ancestor.id in visited:
                raise ValidationError({"parent": "A hierarquia de categorias não pode conter ciclos."})
            visited.add(ancestor.id)
            ancestor = ancestor.parent

    def __str__(self):
        return f"{self.name} ({self.type})"


class Brand(BaseModel):
    name = models.CharField(max_length=120)
    slug = models.CharField(max_length=140, unique=True, validators=[validate_slug])
    logo = models.URLField(blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        verbose_name = "marca"
        verbose_name_plural = "marcas"

    def __str__(self):
        return self.name


class Product(BaseModel):
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=220, unique=True, validators=[validate_slug])
    sku = models.CharField(max_length=60, blank=True, db_index=True)
    description = models.TextField()
    full_description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    old_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    image = models.URLField()
    images = models.JSONField(default=list, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    subcategory = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products_sub",
        verbose_name="subcategoria",
    )
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    specs = models.JSONField(default=list, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_new = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=ProductStatus.choices, default=ProductStatus.PUBLISHED, db_index=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "produto"
        verbose_name_plural = "produtos"
        indexes = [models.Index(fields=["category", "status"])]
        constraints = [
            models.UniqueConstraint(
                Lower("sku"),
                condition=~models.Q(sku=""),
                name="catalog_product_sku_ci_unique",
            ),
        ]

    def clean(self):
        super().clean()
        if self.subcategory_id and self.subcategory.parent_id != self.category_id:
            raise ValidationError({"subcategory": "A subcategoria deve pertencer à categoria selecionada."})

    def save(self, *args, **kwargs):
        self.sku = self.sku.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InventoryMovementType(models.TextChoices):
    ADJUSTMENT = "adjustment", "Ajuste"
    RESERVED = "reserved", "Reservado"
    RELEASED = "released", "Liberado"
    FULFILLED = "fulfilled", "Cumprido"


class InventoryMovement(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements")
    actor = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    type = models.CharField(max_length=20, choices=InventoryMovementType.choices)
    quantity = models.IntegerField()
    note = models.CharField(max_length=255, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "movimento de stock"
        verbose_name_plural = "movimentos de stock"

    def __str__(self):
        return f"{self.type}: {self.product.name} {self.quantity:+d}"
