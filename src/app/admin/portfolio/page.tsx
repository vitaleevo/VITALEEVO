"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, badgeColumn, imageColumn } from "@/shared/components/admin/CrudPage";
import { Loading } from "@/shared/components/admin/ui";

export function AdminPortfolioContent() {
    const { token } = useAuth();
    const { data: cats } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.categories.getByType("portfolio") });

    if (!cats) return <Loading />;

    const fields: CrudField[] = [
        { name: "title", label: "Título", required: true },
        { name: "slug", label: "Slug", placeholder: "auto a partir do título", optional: true },
        { name: "client", label: "Cliente", optional: true },
        { name: "year", label: "Ano", type: "number", optional: true },
        { name: "category", label: "Categoria", type: "select", options: (cats || []).map((c: any) => ({ value: c.slug, label: c.name })), optional: true },
        { name: "image", label: "Imagem de capa", type: "image", optional: true },
        { name: "order", label: "Ordem", type: "number", optional: true },
        { name: "status", label: "Estado", type: "select", options: [
            { value: "published", label: "Publicado" },
            { value: "draft", label: "Rascunho" },
            { value: "archived", label: "Arquivado" },
        ] },
        { name: "is_featured", label: "Destaque no portfólio", type: "checkbox", optional: true },
        { name: "full_description", label: "Descrição", type: "textarea", optional: true, colSpan: 2 },
    ];

    const columns: CrudColumn[] = [
        { key: "image", label: "", render: imageColumn("image") },
        { key: "title", label: "Título", render: (p: any) => <span className="font-bold text-gray-900 dark:text-white">{p.title}</span> },
        { key: "client", label: "Cliente", render: (p: any) => p.client || "—" },
        { key: "category", label: "Categoria", render: (p: any) => p.category || "—" },
        { key: "status", label: "Estado", render: badgeColumn() },
    ];

    return (
        <CrudPage
            title="Portfólio"
            subtitle="Projetos apresentados no site"
            itemName="Projeto"
            permission="content:manage"
            fetcher={() => api.projects.list({ page_size: 100 }).then(d => d.results)}
            columns={columns}
            fields={fields}
            searchKeys={["title", "client", "category"]}
            onCreate={form => api.projects.create(form, token as string)}
            onUpdate={(slug, form) => api.projects.update(slug, form, token as string)}
            onDelete={slug => api.projects.remove(slug, token as string)}
        />
    );
}

export default function AdminPortfolioPage() {
    return <AdminPortfolioContent />;
}