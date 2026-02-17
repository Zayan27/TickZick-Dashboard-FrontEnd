import styled from 'styled-components';

export const DragDropWrapper = styled.div`
    .drag-drop-label {
        display: block;
        font-weight: 600;
        color: var(--text-dark, #333);
        margin-bottom: 8px;
        font-size: 14px;
    }

    .drag-drop-description {
        color: var(--text-gray, #666);
        font-size: 12px;
        margin-bottom: 16px;
    }

    .drag-drop-error {
        color: #ff4d4f;
        font-size: 12px;
        margin-bottom: 16px;
    }

    .drag-drop-preview {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-color, #d9d9d9);
        background-color: var(--bg-gray, #fafafa);

        .preview-image-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .remove-button {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            background-color: #ff4d4f;
            border-color: #ff4d4f;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover {
                background-color: #ff7875 !important;
                border-color: #ff7875 !important;
            }
        }
    }

    .drag-drop-area {
        width: 100%;
        border-radius: 8px;
        border: 2px dashed var(--border-color, #d9d9d9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background-color: var(--bg-gray, #fafafa);

        &:hover {
            background-color: var(--bg-gray-hover, #f0f0f0);
            border-color: var(--primary-color, #6dbe45);
        }

        &.dragging {
            border-color: var(--primary-color, #6dbe45);
            background-color: var(--primary-light, #f8fef5);
        }

        .drag-drop-content {
            text-align: center;
            padding: 24px;

            .upload-icon {
                font-size: 48px;
                color: var(--text-light, #bfbfbf);
                margin-bottom: 16px;
            }

            .upload-text {
                color: var(--text-gray, #666);
                font-size: 14px;
                margin-bottom: 16px;
            }

            .browse-button {
                height: 40px;
                padding: 0 32px;
                background-color: white;
                border-color: var(--primary-color, #6dbe45);
                color: var(--primary-color, #6dbe45);
                
                &:hover {
                    background-color: var(--primary-color, #6dbe45) !important;
                    color: white !important;
                    border-color: var(--primary-color, #6dbe45) !important;
                }
            }
        }
    }

    /* Dark mode styles */
    .dark & {
        .drag-drop-label {
            color: var(--text-white-87, rgba(255, 255, 255, 0.87));
        }

        .drag-drop-description {
            color: var(--text-white-60, rgba(255, 255, 255, 0.6));
        }

        .drag-drop-preview {
            border-color: var(--border-white-10, rgba(255, 255, 255, 0.1));
            background-color: var(--bg-white-10, rgba(255, 255, 255, 0.1));
        }

        .drag-drop-area {
            border-color: var(--border-white-10, rgba(255, 255, 255, 0.1));
            background-color: var(--bg-white-10, rgba(255, 255, 255, 0.1));

            &:hover {
                background-color: var(--bg-white-30, rgba(255, 255, 255, 0.3));
                border-color: var(--primary-color, #6dbe45);
            }

            &.dragging {
                background-color: var(--primary-light, rgba(109, 190, 69, 0.1));
            }

            .drag-drop-content {
                .upload-icon {
                    color: var(--text-white-60, rgba(255, 255, 255, 0.6));
                }

                .upload-text {
                    color: var(--text-white-60, rgba(255, 255, 255, 0.6));
                }

                .browse-button {
                    background-color: var(--bg-white-10, rgba(255, 255, 255, 0.1));
                    color: var(--primary-color, #6dbe45);
                    
                    &:hover {
                        background-color: var(--primary-color, #6dbe45) !important;
                        color: white !important;
                    }
                }
            }
        }
    }
`;