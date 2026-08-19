"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, badgeColumn } from "@/shared/components/admin/CrudPage";

const fields: CrudField[] = [
    { name: "title", label: "Título", required: true },
    { name: "slug", label: "Slug", placeholder: "auto a partir do título", optional: true },
    {
        name: "status", label: "Estado", type: "select",
        options: [
            { value: "published", label: "Publicado" },
            { value: "draft", label: "Rascunho" },
            { value: "archived", label: "Arquivado" },
        ],
    },
    { name: "content", label: "Conteúdo", type: "richtext", optional: true, colSpan: 2 },
];

const columns: CrudColumn[] = [
    { key: "title", label: "Título", render: (l: any) => <span className="font-bold text-gray-900 dark:text-white">{l.title}</span> },
    { key: "slug", label: "Slug", render: (l: any) => <span className="font-mono text-xs">{l.slug}</span> },
    { key: "status", label: "Estado", render: badgeColumn() },
    { key: "updated_at", label: "Atualizado", render: (l: any) => String(l.updatedAt || l.updated_at || "").slice(0, 10) },
];

export default function AdminLegalPage() {
    const { token } = useAuth();
    return (
        <CrudPage
            title="Documentos Legais"
            subtitle="Políticas e termos do site"
            itemName="Documento"
            fetcher={() => api.legal.list()}
            columns={columns}
            fields={fields}
            searchKeys={["title", "slug"]}
            onCreate={form => api.legal.upsert(form, token as string)}
            onUpdate={(slug, form) => api.legal.update(slug, form, token as string)}
            onDelete={slug => api.legal.remove(slug, token as string)}
        />
    );
}