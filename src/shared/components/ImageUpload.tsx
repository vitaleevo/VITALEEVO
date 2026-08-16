"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    purpose?: "product" | "content" | "profile";
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({ value, onChange, label, purpose = "content" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const registerUpload = useMutation(api.files.registerUpload);
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!token) {
            alert("A sessão expirou. Entre novamente para enviar imagens.");
            return;
        }
        if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
            alert("Use JPG, PNG, WebP ou AVIF com até 5 MB.");
            return;
        }

        setIsUploading(true);
        setHasError(false);
        try {
            // 1. Get a short-lived upload URL
            const postUrl = await generateUploadUrl({
                token,
                purpose,
                contentType: file.type,
                size: file.size,
            });

            // 2. POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Upload failed");

            const { storageId } = await result.json();

            const uploaded = await registerUpload({
                token,
                storageId,
                filename: file.name,
                contentType: file.type,
                size: file.size,
                purpose,
            });
            onChange(uploaded.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Erro no upload. Tente novamente.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleImageChange = (url: string) => {
        setHasError(false);
        onChange(url);
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center group">
                    {value && !hasError ? (
                        <>
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setHasError(true)}
                            />
                            <button
                                onClick={() => handleImageChange("")}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                type="button"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-2">
                            {hasError ? (
                                <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-1" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                            )}
                            <p className="text-[10px] text-gray-400 font-medium">
                                {hasError ? "Erro na imagem" : "Sem imagem"}
                            </p>
                        </div>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {value ? "Alterar Imagem" : "Selecionar Imagem"}
                    </button>
                    {value && (
                        <p className="text-[10px] text-gray-400 mt-1 break-all line-clamp-1">
                            Link: {value.substring(0, 50)}...
                        </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                        Recomendado: 800x800px. JPG, PNG ou WebP.
                    </p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
            />
        </div>
    );
}
