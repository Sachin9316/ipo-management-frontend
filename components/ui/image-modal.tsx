"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    title?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    title = "Image Preview",
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    if (!imageUrl) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-transparent border-none shadow-none text-white">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-[80vw] max-h-[80vh] object-contain rounded-md shadow-2xl"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
