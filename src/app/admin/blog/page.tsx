"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import CrudPage, { CrudField, CrudColumn, badgeColumn, imageColumn } from "@/shared/components/admin/CrudPage";
import { Loading } from "@/shared/components/admin/ui";

export function AdminBlogContent() {
    const { token } = useAuth();
    const { data: cats } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.categories.getByType("blog") });

    if (!cats) return <Loading />;

    const categoryOptions = (cats || []).map((c: any) => ({ value: c.slug, label: c.name }));
    const fields: CrudField[] = [
        { name: "title", label: "Título", required: true },
        { name: "slug", label: "Slug", placeholder: "auto a partir do título", optional: true },
        { name: "category", label: "Categoria", type: "select", options: categoryOptions, optional: true },
        { name: "image", label: "Imagem de capa", type: "image", optional: true },
        { name: "read_time", label: "Tempo de leitura (min)", type: "number", optional: true },
        { name: "author", label: "Autor", optional: true },
        { name: "author_role", label: "Função do autor", optional: true },
        { name: "author_image", label: "Foto do autor", type: "image", optional: true },
        { name: "seo_title", label: "Título SEO", optional: true },
        { name: "seo_description", label: "Descrição SEO", type: "textarea", optional: true, colSpan: 2 },
        { name: "status", label: "Estado", type: "select", options: [
            { value: "published", label: "Publicado" },
            { value: "draft", label: "Rascunho" },
            { value: "archived", label: "Arquivado" },
        ] },
        { name: "is_featured", label: "Destaque no blog", type: "checkbox", optional: true },
        { name: "excerpt", label: "Resumo", type: "textarea", optional: true, colSpan: 2 },
        { name: "content", label: "Conteúdo", type: "richtext", optional: true, colSpan: 2 },
    ];

    const columns: CrudColumn[] = [
        { key: "image", label: "", render: imageColumn("image") },
        { key: "title", label: "Título", render: (a: any) => <span className="font-bold text-gray-900 dark:text-white">{a.title}</span> },
        { key: "category", label: "Categoria", render: (a: any) => a.category || "—" },
        { key: "status", label: "Estado", render: badgeColumn() },
        { key: "published_at", label: "Publicado", render: (a: any) => String(a.publishedAt || a.published_at || "").slice(0, 10) || "—" },
    ];

    return (
        <>
            {categoryOptions.length === 0 && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                    Nenhuma categoria de blog encontrada. Crie em <Link href="/admin/categories" className="font-bold underline">/admin/categories</Link> com Tipo = Blog (ex: Tecnologia, Marketing Digital).
                </div>
            )}
            <CrudPage
                title="Blog"
                subtitle="Artigos do blog"
                itemName="Artigo"
                permission="content:manage"
                previewBasePath="/blog"
                fetcher={() => api.articles.list({ page_size: 100 }, token).then(d => d.results)}
                columns={columns}
                fields={fields}
                searchKeys={["title", "slug", "category"]}
                onCreate={form => api.articles.create(form, token as string)}
                onUpdate={(slug, form) => api.articles.update(slug, form, token as string)}
                onDelete={slug => api.articles.remove(slug, token as string)}
            />
        </>
    );
}

export default function AdminBlogPage() {
    return <AdminBlogContent />;
}
