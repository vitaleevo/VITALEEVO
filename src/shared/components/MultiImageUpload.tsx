"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Plus } from "lucide-react";

interface MultiImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    label?: string;
}

export default function MultiImageUpload({ value, onChange, label }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const getStorageUrl = useMutation(api.files.getUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const newUrls = [...value];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // 1. Get a short-lived upload URL
                const postUrl = await generateUploadUrl();

                // 2. POST the file to the URL
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) throw new Error("Upload failed");

                const { storageId } = await result.json();

                // 3. Get the public URL
                let publicUrl = null;
                let attempts = 0;
                while (!publicUrl && attempts < 5) {
                    publicUrl = await getStorageUrl({ storageId });
                    if (!publicUrl) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        attempts++;
                    }
                }

                if (publicUrl) {
                    newUrls.push(publicUrl);
                }
            }

            onChange(newUrls);
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Erro no upload de uma ou mais imagens. Tente novamente.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        const newUrls = value.filter((_, i) => i !== index);
        onChange(newUrls);
    };

    return (
        <div className="space-y-4">
            {label && (
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {value.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5 group">
                        <img
                            src={url}
                            alt={`Upload ${index}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            type="button"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                {/* Upload Placeholder / Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-primary hover:border-primary/50 group disabled:opacity-50"
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Plus className="w-6 h-6 group-hover:text-primary" />
                            </div>
                            <span className="text-xs font-bold">Adicionar</span>
                        </>
                    )}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                multiple
                className="hidden"
            />

            <p className="text-[10px] text-gray-400">
                Você pode selecionar várias imagens de uma vez. Formatos: JPG, PNG, WebP.
            </p>
        </div>
    );
}
