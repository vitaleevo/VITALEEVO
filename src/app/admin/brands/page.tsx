"use client";

import React from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, imageColumn } from "@/shared/components/admin/CrudPage";

const fields: CrudField[] = [
    { name: "name", label: "Nome", required: true },
    { name: "slug", label: "Slug", placeholder: "auto a partir do nome", optional: true },
];

const columns: CrudColumn[] = [
    { key: "name", label: "Nome", render: (b: any) => <span className="font-bold text-gray-900 dark:text-white">{b.name}</span> },
    { key: "slug", label: "Slug", render: (b: any) => <span className="font-mono text-xs">{b.slug}</span> },
];

export function AdminBrandsContent() {
    const { token } = useAuth();
    return (
        <CrudPage
            title="Marcas"
            subtitle="Marcas do catálogo"
            itemName="Marca"
            permission="catalog:read"
            managePermission="catalog:manage"
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

export default function AdminBrandsPage() {
    return <AdminBrandsContent />;
}