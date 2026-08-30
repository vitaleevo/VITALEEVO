"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, badgeColumn, imageColumn } from "@/shared/components/admin/CrudPage";

const fields: CrudField[] = [
    { name: "title", label: "Título", required: true },
    { name: "slug", label: "Slug", placeholder: "auto a partir do título", optional: true },
    { name: "subtitle", label: "Subtítulo", optional: true },
    { name: "icon", label: "Ícone", optional: true },
    { name: "image", label: "Imagem", type: "image", optional: true },
    { name: "order", label: "Ordem", type: "number", optional: true },
    {
        name: "status", label: "Estado", type: "select",
        options: [
            { value: "published", label: "Publicado" },
            { value: "draft", label: "Rascunho" },
            { value: "archived", label: "Arquivado" },
        ],
    },
    { name: "description", label: "Descrição", type: "textarea", optional: true, colSpan: 2 },
    { name: "features", label: "Itens incluídos (separados por vírgula)", type: "textarea", optional: true, colSpan: 2 },
    { name: "benefits", label: "Benefícios (JSON)", type: "textarea", optional: true, colSpan: 2 },
    { name: "process", label: "Processo (JSON)", type: "textarea", optional: true, colSpan: 2 },
    { name: "cta_text", label: "Texto do botão principal", optional: true },
];

const columns: CrudColumn[] = [
    { key: "image", label: "", render: imageColumn("image") },
    { key: "title", label: "Título", render: (s: any) => <span className="font-bold text-gray-900 dark:text-white">{s.title}</span> },
    { key: "slug", label: "Slug", render: (s: any) => <span className="font-mono text-xs">{s.slug}</span> },
    { key: "order", label: "Ordem" },
    { key: "status", label: "Estado", render: badgeColumn() },
];

export function AdminServicesContent() {
    const { token } = useAuth();
    return (
        <CrudPage
            title="Serviços"
            subtitle="Serviços apresentados no site"
            itemName="Serviço"
            permission="content:manage"
            fetcher={() => api.services.list({ page_size: 100 }, token)}
            columns={columns}
            fields={fields}
            searchKeys={["title", "slug"]}
            onCreate={form => api.services.create(form, token as string)}
            onUpdate={(slug, form) => api.services.update(slug, form, token as string)}
            onDelete={slug => api.services.remove(slug, token as string)}
        />
    );
}

export default function AdminServicesPage() {
    return <AdminServicesContent />;
}
