import React, { useState } from 'react';
import { Row, Col, Form, Input, message, Alert, Upload } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function SupportTicketCreate() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [authRole] = useState(getItem("auth_role"));
    const [fileList, setFileList] = useState([]);

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('subject', values.subject);
            formData.append('email', values.email);
            formData.append('description', values.description);

            // Add attachment if exists
            if (fileList.length > 0) {
                formData.append('attachment', fileList[0].originFileObj);
            }

            const res = await DataService.post(`/${authRole}/support-tickets/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.status) {
                message.success(res.data.message || 'Support ticket created successfully!');
                form.resetFields();
                setFileList([]);
            } else {
                throw new Error(res.data.message || 'Failed to create support ticket');
            }
        } catch (error) {
            console.error("Support tickets store error:", error);

            if (error.response) {
                // Handle server errors
                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Failed to create support ticket';
                message.error(errorMessage);
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('Failed to create support ticket. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // Check file type (zip only)
            const isZip = file.type === 'application/zip' ||
                file.type === 'application/x-zip-compressed' ||
                file.name.toLowerCase().endsWith('.zip');

            if (!isZip) {
                message.error('You can only upload ZIP files!');
                return Upload.LIST_IGNORE;
            }

            // Check file size (5MB = 5 * 1024 * 1024 bytes)
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            return false; // Prevent automatic upload
        },
        fileList,
    };

    return (
        <>
            <PageHeader
                className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
                ghost
                title="Create Support Ticket"
            />

            <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={15}>
                    <Col xs={24}>
                        <div className="bg-white rounded-10 dark:bg-white10 p-[25px]">
                            <Alert
                                message="Support Information"
                                description="Please provide detailed information about your issue. You can attach a ZIP file (max 5MB) if needed."
                                type="info"
                                showIcon
                                className="mb-[25px]"
                            />

                            <Form
                                className="mt-[25px]"
                                style={{ width: '100%' }}
                                layout="vertical"
                                form={form}
                                name="supportTicket"
                                onFinish={handleSubmit}
                            >
                                <Row gutter={20}>
                                    {/* Subject */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                                            name="subject"
                                            label="Subject"
                                            rules={[{ required: true, message: 'Please enter the subject!' }]}
                                            hasFeedback
                                        >
                                            <Input
                                                placeholder="Enter subject of your issue"
                                                size="large"
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* Email */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                                            name="email"
                                            label="Email Address"
                                            rules={[
                                                { required: true, message: 'Please enter your email!' },
                                                { type: 'email', message: 'Please enter a valid email!' }
                                            ]}
                                            hasFeedback
                                        >
                                            <Input
                                                placeholder="Enter your email address"
                                                size="large"
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* Description */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>textarea]:border-normal dark:[&>.ant-form-item-row>div>div>div>textarea]:text-white60 dark:[&>.ant-form-item-row>div>div>div>textarea]:border-white10 [&>.ant-form-item-row>div>div>div>textarea]:rounded-md"
                                            name="description"
                                            label="Description"
                                            rules={[{ required: true, message: 'Please enter the description!' }]}
                                            hasFeedback
                                        >
                                            <TextArea
                                                placeholder="Describe your issue in detail"
                                                rows={6}
                                                size="large"
                                                showCount
                                                maxLength={5000}
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* Attachment */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                                            label="Attachment (Optional)"
                                            help="Upload a ZIP file (max 5MB) if you need to attach screenshots or documents"
                                        >
                                            <Upload {...uploadProps}>
                                                <Button
                                                    icon={<UploadOutlined />}
                                                    size="large"
                                                >
                                                    Click to Upload (ZIP only, max 5MB)
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Form Actions */}
                                <Row gutter={20} className="mt-[40px] pt-[25px] border-t border-gray-200 dark:border-white10">
                                    <Col xs={24} className="flex justify-end gap-[15px]">
                                        <Button
                                            className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-md px-[24px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                                            size="default"
                                            htmlType="submit"
                                            type="primary"
                                            loading={loading}
                                        >
                                            {loading ? 'Creating Ticket...' : 'Create Support Ticket'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </main>
        </>
    );
}

export default SupportTicketCreate;