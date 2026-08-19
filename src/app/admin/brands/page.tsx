"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, imageColumn } from "@/shared/components/admin/CrudPage";

const fields: CrudField[] = [
    { name: "name", label: "Nome", required: true },
    { name: "slug", label: "Slug", placeholder: "auto a partir do nome", optional: true },
    { name: "logo", label: "Logótipo", type: "image", optional: true },
    { name: "description", label: "Descrição", type: "textarea", optional: true, colSpan: 2 },
    { name: "order", label: "Ordem", type: "number", optional: true },
];

const columns: CrudColumn[] = [
    { key: "logo", label: "", render: imageColumn("logo") },
    { key: "name", label: "Nome", render: (b: any) => <span className="font-bold text-gray-900 dark:text-white">{b.name}</span> },
    { key: "slug", label: "Slug", render: (b: any) => <span className="font-mono text-xs">{b.slug}</span> },
    { key: "description", label: "Descrição", render: (b: any) => <span className="line-clamp-1 max-w-xs">{b.description || "—"}</span> },
];

export default function AdminBrandsPage() {
    const { token } = useAuth();
    return (
        <CrudPage
            title="Marcas"
            subtitle="Marcas do catálogo"
            itemName="Marca"
            fetcher={() => api.brands.list()}
            columns={columns}
            fields={fields}
            searchKeys={["name", "slug"]}
            onCreate={form => api.brands.create(form, token as string)}
            onUpdate={(slug, form) => api.brands.update(slug, form, token as string)}
            onDelete={slug => api.brands.remove(slug, token as string)}
        />
    );
}