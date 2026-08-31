"""Migrações aditivas para a base FastAPI/SQLAlchemy existente.

O projeto ainda não usa Alembic. Esta rotina mantém upgrades de colunas
idempotentes em SQLite e PostgreSQL, sem apagar ou recriar tabelas em produção.
"""

from sqlalchemy import inspect

from app.db.session import get_engine


ADDITIVE_COLUMNS: dict[str, dict[str, str]] = {
    "users": {"token_version": "INTEGER"},
    "products": {
        "gallery": "TEXT",
        "specifications": "TEXT",
        "status": "VARCHAR(20)",
        "updated_at": "TIMESTAMP",
    },
    "articles": {
        "is_featured": "BOOLEAN",
        "read_time": "VARCHAR(20)",
        "author": "VARCHAR(160)",
        "author_role": "VARCHAR(160)",
        "author_image": "VARCHAR(500)",
        "seo_title": "VARCHAR(255)",
        "seo_description": "VARCHAR(500)",
        "updated_at": "TIMESTAMP",
    },
    "projects": {
        "full_description": "TEXT",
        "images": "TEXT",
        "client": "VARCHAR(200)",
        "year": "INTEGER",
        "display_order": "INTEGER",
        "challenge": "TEXT",
        "solution": "TEXT",
        "results": "TEXT",
        "tags": "TEXT",
        "seo_title": "VARCHAR(255)",
        "seo_description": "VARCHAR(500)",
        "created_at": "TIMESTAMP",
        "updated_at": "TIMESTAMP",
    },
    "quotes": {
        "user_email": "VARCHAR(255)",
        "company": "VARCHAR(200)",
        "message": "TEXT",
        "assigned_to": "VARCHAR(255)",
        "next_follow_up_at": "TIMESTAMP",
        "proposal": "TEXT",
        "updated_at": "TIMESTAMP",
    },
    "orders": {
        "access_token_hash": "VARCHAR(120)",
        "shipping_address": "TEXT",
        "updated_at": "TIMESTAMP",
    },
    "addresses": {
        "name": "VARCHAR(200)",
        "phone": "VARCHAR(40)",
        "city": "VARCHAR(120)",
        "reference": "TEXT",
    },
    "notifications": {
        "type": "VARCHAR(40)",
        "metadata_json": "TEXT",
    },
    "services": {
        "benefits": "TEXT",
        "process": "TEXT",
        "cta_text": "VARCHAR(160)",
    },
}


async def run_additive_migrations() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        existing = await conn.run_sync(
            lambda sync_conn: {
                table: {column["name"] for column in inspect(sync_conn).get_columns(table)}
                for table in inspect(sync_conn).get_table_names()
            }
        )
        for table, columns in ADDITIVE_COLUMNS.items():
            if table not in existing:
                continue
            for column, sql_type in columns.items():
                if column in existing[table]:
                    continue
                await conn.exec_driver_sql(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {sql_type}')

        # Backfill apenas valores seguros; mantém compatibilidade com registos antigos.
        backfills = {
            "users": {"token_version": "0"},
            "products": {"gallery": "[]", "specifications": "{}", "status": "published"},
            "articles": {"author": "Equipa Vitaleevo", "author_role": "Especialista"},
            "projects": {
                "full_description": "",
                "images": "[]",
                "display_order": "0",
                "challenge": "",
                "solution": "",
                "results": "[]",
                "tags": "[]",
            },
            "quotes": {"company": "", "message": "", "proposal": "{}"},
            "orders": {"access_token_hash": "", "shipping_address": "{}"},
            "addresses": {"name": "", "phone": "", "city": "Luanda", "reference": ""},
            "notifications": {"type": "system", "metadata_json": "{}"},
            "services": {"benefits": "[]", "process": "[]", "cta_text": "Solicitar proposta"},
        }
        for table, values in backfills.items():
            if table not in existing:
                continue
            for column, value in values.items():
                if column not in ADDITIVE_COLUMNS.get(table, {}) and column not in existing[table]:
                    continue
                escaped = value.replace("'", "''")
                await conn.exec_driver_sql(
                    f'UPDATE "{table}" SET "{column}" = \'{escaped}\' WHERE "{column}" IS NULL'
                )
