import React, { useState, useRef } from 'react';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { DragDropWrapper } from './styled';

export const DragDrop = ({
    onFileChange,
    acceptedFileTypes = 'image/*',
    maxFileSize = 2 * 1024 * 1024, // 2MB default
    className,
    label,
    description,
    required = false,
    previewSize = 'h-[400px]',
    initialPreview = null,
}) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialPreview);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (selectedFile) => {
        setError(null);

        // Check file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Check file size
        if (selectedFile.size > maxFileSize) {
            setError(`File size must be less than ${maxFileSize / 1024 / 1024}MB`);
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        onFileChange(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const handleRemove = () => {
        if (previewUrl && !initialPreview) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(initialPreview);
        setError(null);
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <DragDropWrapper className={`mb-8 ${className || ''}`}>
            {label && (
                <label className="drag-drop-label">
                    {label}{required && '*'}
                </label>
            )}

            {description && (
                <p className="drag-drop-description">
                    {description}
                </p>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept={acceptedFileTypes}
                className="hidden"
            />

            {error && (
                <p className="drag-drop-error">
                    {error}
                </p>
            )}

            {previewUrl ? (
                <div className={`drag-drop-preview ${previewSize}`}>
                    <div className="preview-image-container">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="preview-image"
                        />
                    </div>
                    <Button
                        onClick={handleRemove}
                        className="remove-button"
                        icon={<CloseOutlined className="text-xs" />}
                        size="small"
                        type="primary"
                        danger
                    />
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`drag-drop-area ${previewSize} ${isDragging ? 'dragging' : ''}`}
                >
                    <div className="drag-drop-content">
                        <UploadOutlined className="upload-icon" />
                        <p className="upload-text">
                            Drag and drop your file here or click to browse
                        </p>
                        <Button
                            icon={<UploadOutlined />}
                            className="browse-button"
                        >
                            Browse Files
                        </Button>
                    </div>
                </div>
            )}
        </DragDropWrapper>
    );
};