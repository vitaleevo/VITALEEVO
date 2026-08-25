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
        ],
    },
    { name: "seo_title", label: "Título SEO", optional: true },
    { name: "seo_description", label: "Descrição SEO", optional: true },
];

const columns: CrudColumn[] = [
    { key: "title", label: "Título", render: (p: any) => <span className="font-bold text-gray-900 dark:text-white">{p.title}</span> },
    { key: "slug", label: "Slug", render: (p: any) => <span className="font-mono text-xs">{p.slug}</span> },
    { key: "status", label: "Estado", render: badgeColumn() },
];

export function AdminSiteContent() {
    const { token } = useAuth();
    return (
        <CrudPage
            title="Páginas do Site"
            subtitle="Páginas internas e SEO"
            itemName="Página"
            permission="content:manage"
            fetcher={() => api.pages.list({ page_size: 100 })}
            columns={columns}
            fields={fields}
            searchKeys={["title", "slug"]}
            onCreate={form => api.pages.create(form, token as string)}
            onUpdate={(slug, form) => api.pages.update(slug, form, token as string)}
            onDelete={slug => api.pages.remove(slug, token as string)}
        />
    );
}

export default function AdminSitePage() {
    return <AdminSiteContent />;
}
