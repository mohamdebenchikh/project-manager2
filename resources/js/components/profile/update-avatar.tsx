import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputError } from "@/components/ui/input-error";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface UpdateAvatarProps {
    user: {
        name: string;
        avatar: string | null;
    };
}

export default function UpdateAvatar({ user }: UpdateAvatarProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewAvatarFile, setPreviewAvatarFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 60,
        height: 60,
        x: 0,
        y: 0,
    });
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const validateFile = (file: File): string | null => {
        if (file.size > 5 * 1024 * 1024) {
            return "File size must be less than 5MB";
        }

        if (!file.type.startsWith('image/')) {
            return "Please select an image file";
        }

        return null;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const error = validateFile(file);
            if (error) {
                setUploadError(error);
                return;
            }

            setUploadError(null);
            setPreviewAvatarFile(file);
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
            setShowPreviewDialog(true);
            
            // Reset crop when new image is selected
            setCrop({
                unit: '%',
                width: 100,
                height: 100,
                x: 0,
                y: 0,
            });
            setCompletedCrop(null);
        }
    };

    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    const getCroppedImg = async (
        image: HTMLImageElement,
        crop: Crop
    ): Promise<Blob | null> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 1);
        });
    };

    const updateProfileAvatar = async (avatarUrl: string) => {
        try {
            router.patch(
                route("profile.updateAvatar"),
                {
                    avatar: avatarUrl,
                },
                {
                    onSuccess() {
                        setShowPreviewDialog(false);
                        setIsUploading(false);
                    },
                    onError(errors) {
                        setUploadError(errors.avatar || "Failed to update avatar");
                        setIsUploading(false);
                    },
                }
            );
        } catch (error: any) {
            setUploadError(error.message || "Failed to update avatar");
            setIsUploading(false);
        }
    };

    const confirmAvatar = async () => {
        try {
            if (!imgRef.current || !completedCrop) {
                setUploadError("Please complete the crop");
                return;
            }

            setIsUploading(true);
            setUploadError(null);

            const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
            if (!croppedImage) {
                throw new Error("Failed to crop image");
            }

            const formData = new FormData();
            formData.append("file", croppedImage, "cropped-avatar.jpg");
            formData.append("type", "avatar");
            formData.append("folder", "avatars");

            const response = await axios.post(route("upload"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.url) {
                await updateProfileAvatar(response.data.url);
            } else {
                throw new Error("Failed to get upload URL");
            }
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            setUploadError(error.response?.data?.message || error.message || "Failed to upload avatar");
            setIsUploading(false);
        }
    };

    const cancelAvatar = () => {
        setAvatarPreview(null);
        setShowPreviewDialog(false);
        setUploadError(null);
        setIsUploading(false);
        setCrop({
            unit: '%',
            width: 100,
            height: 100,
            x: 0,
            y: 0,
        });
        setCompletedCrop(null);
    };

    return (
        <>
            <div className="flex items-center space-x-6">
                <div className="shrink-0">
                    <Avatar className="h-16 w-16">
                        <AvatarImage
                            src={avatarPreview ?? user.avatar ?? ""}
                            alt="Profile"
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <Label htmlFor="avatar">Profile Photo</Label>
                    <Input
                        ref={fileInputRef}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full"
                        onChange={handleAvatarChange}
                    />
                    <InputError className="mt-2" message={uploadError ?? ""} />
                </div>
            </div>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop Avatar</DialogTitle>
                        <DialogDescription>
                            Adjust the crop area to select your profile photo
                        </DialogDescription>
                    </DialogHeader>
                    {previewAvatarFile && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex justify-center p-6 max-w-[400px] max-h-[400px]">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(newCrop) => setCrop(newCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop preview"
                                        src={URL.createObjectURL(previewAvatarFile)}
                                        style={{ maxWidth: '100%', maxHeight: '400px', width: 'auto', objectFit: 'contain' }}
                                    />
                                </ReactCrop>
                            </div>
                            {uploadError && (
                                <div className="text-sm text-destructive">
                                    {uploadError}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={cancelAvatar}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={confirmAvatar}
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
