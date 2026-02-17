import styled from 'styled-components';

export const MultiLangWrapper = styled.div`
    .lang-tabs {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .lang-tab {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 14px;
        transition: all 0.3s;
        border: none;
        cursor: pointer;
        background-color: #f3f4f6;
        color: #4b5563;

        &:hover {
            background-color: #e5e7eb;
        }

        &.active {
            background-color: #6dbe45;
            color: white;
        }
    }

    .completion-status {
        display: flex;
        gap: 16px;
        margin-top: 8px;
    }

    .status-item {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #d1d5db;

        &.filled {
            background-color: #6dbe45;
        }
    }

    .status-label {
        color: #4b5563;
        font-size: 12px;
    }

    /* Dark mode styles */
    .dark & {
        label {
            color: #ffffff87;
        }

        .lang-tab {
            background-color: #ffffff10;
            color: #ffffff60;

            &:hover {
                background-color: #ffffff30;
            }

            &.active {
                background-color: #6dbe45;
                color: white;
            }
        }

        .status-dot {
            background-color: #ffffff30;

            &.filled {
                background-color: #6dbe45;
            }
        }

        .status-label {
            color: #ffffff60;
        }
    }
`;