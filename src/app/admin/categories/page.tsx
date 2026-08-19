"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn } from "@/shared/components/admin/CrudPage";
import { Loading } from "@/shared/components/admin/ui";

const fields: CrudField[] = [
    { name: "name", label: "Nome", required: true },
    { name: "slug", label: "Slug", placeholder: "auto a partir do nome", optional: true },
    {
        name: "type", label: "Tipo", type: "select", required: true,
        options: [
            { value: "store", label: "Loja" },
            { value: "blog", label: "Blog" },
            { value: "portfolio", label: "Portfólio" },
        ],
    },
    { name: "parent", label: "Categoria pai", type: "select", options: [], optional: true },
    { name: "description", label: "Descrição", type: "textarea", optional: true, colSpan: 2 },
    { name: "order", label: "Ordem", type: "number", optional: true },
];

export default function AdminCategoriesPage() {
    const { token } = useAuth();
    const { data: all } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.categories.getByType("store") });

    if (!all) return <Loading />;

    const parentOptions = (all || []).filter((c: any) => !c.parent).map((c: any) => ({ value: c.slug, label: c.name }));
    const withParents = fields.map(f => (f.name === "parent" ? { ...f, options: parentOptions } : f));

    const columns: CrudColumn[] = [
        { key: "name", label: "Nome", render: (c: any) => <span className="font-bold text-gray-900 dark:text-white">{c.name}</span> },
        { key: "slug", label: "Slug", render: (c: any) => <span className="font-mono text-xs">{c.slug}</span> },
        { key: "type", label: "Tipo" },
        { key: "parent", label: "Pai", render: (c: any) => c.parent || "—" },
        { key: "order", label: "Ordem" },
    ];

    return (
        <CrudPage
            title="Categorias"
            subtitle="Categorias e subcategorias do catálogo"
            itemName="Categoria"
            fetcher={() => api.categories.getByType("store")}
            columns={columns}
            fields={withParents}
            searchKeys={["name", "slug", "type"]}
            onCreate={form => api.categories.create(form, token as string)}
            onUpdate={(slug, form) => api.categories.update(slug, form, token as string)}
            onDelete={slug => api.categories.remove(slug, token as string)}
        />
    );
}