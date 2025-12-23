"use client";

import { useEffect, useState, useRef } from "react";
import { useGetUserQuery, useUpdateUserMutation } from "@/lib/features/auth/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCredentials, selectCurrentToken } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function ProfilePage() {
    const { data: user, isLoading, refetch } = useGetUserQuery(undefined);
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectCurrentToken);

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setRole(user.role);
            setPreviewImage(user.profileImage || null);
        }
    }, [user]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: 0.1, // 100KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                toast.info("Compressing image...");
                const compressedFile = await imageCompression(file, options);

                setSelectedFile(compressedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
                toast.success("Image compressed successfully");
            } catch (error) {
                console.error("Compression failed:", error);
                toast.error("Failed to compress image");
                // Fallback to original file if compression fails
                setSelectedFile(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (selectedFile) {
                formData.append("profileImage", selectedFile);
            }

            const updatedUser = await updateUser(formData).unwrap();

            if (token) {
                dispatch(setCredentials({ user: updatedUser, token }));
            }

            toast.success("Profile updated successfully");
            refetch();
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-12 text-center md:text-left">Profile Settings</h1>

            <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-12 items-start">
                {/* Left Column: Avatar */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-6">
                    <div className="relative group cursor-pointer w-48 h-48" onClick={triggerFileInput}>
                        <Avatar className="w-full h-full border-2 border-border/50 shadow-sm transition-all group-hover:border-primary/50">
                            <AvatarImage src={previewImage || ""} alt={name} className="object-cover" />
                            <AvatarFallback className="text-6xl text-muted-foreground bg-secondary/50">
                                {name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                            <Camera className="text-white h-12 w-12" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={triggerFileInput}
                    >
                        Change Photo
                    </Button>
                </div>

                {/* Right Column: Form Fields */}
                <div className="w-full md:w-2/3 space-y-8 max-w-lg">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="h-11 bg-background/50 border-input/60 focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                            <Input
                                id="email"
                                value={user?.email || ""}
                                disabled
                                className="h-11 bg-secondary/30 text-muted-foreground border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-base font-medium">Account Role</Label>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800'
                                        : 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
                                    } uppercase`}>
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto min-w-[140px] h-11 text-base font-medium transition-all hover:opacity-90 active:scale-95"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
