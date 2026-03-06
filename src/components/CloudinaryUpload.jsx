import { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

function CloudinaryUpload({ currentUrl, onUpload, label = "Upload Image", token }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || "");
    const [error, setError] = useState("");
    const inputRef = useRef();

    // Sync preview when parent switches to a different product
    useEffect(() => {
        setPreview(currentUrl || "");
    }, [currentUrl]);

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File too large. Max 10MB.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (data.success && data.url) {
                setPreview(data.url);
                onUpload(data.url);
            } else {
                setError(data.message || "Upload failed. Please try again.");
            }
        } catch (err) {
            setError("Upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const clearImage = () => {
        setPreview("");
        onUpload("");
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="cloudinary-upload">
            <label className="cld-label">{label}</label>
            {preview ? (
                <div className="cld-preview-wrap">
                    <img src={preview} alt="preview" className="cld-preview-img" />
                    <div className="cld-preview-actions">
                        <button
                            type="button"
                            className="cld-change-btn"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                        >
                            <FiUpload /> {uploading ? "Uploading…" : "Change"}
                        </button>
                        <button type="button" className="cld-remove-btn" onClick={clearImage}>
                            <FiX /> Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`cld-dropzone ${uploading ? "uploading" : ""}`}
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {uploading ? (
                        <>
                            <div className="spinner small" />
                            <span>Uploading…</span>
                        </>
                    ) : (
                        <>
                            <FiImage className="cld-icon" />
                            <span className="cld-hint">Click or drag & drop to upload</span>
                            <span className="cld-hint-small">PNG, JPG, WEBP up to 10MB</span>
                        </>
                    )}
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
            />
            {error && <p className="cld-error">{error}</p>}
        </div>
    );
}

export default CloudinaryUpload;
