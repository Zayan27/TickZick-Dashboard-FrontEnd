import React, { useState } from 'react';
import { Row, Col, Form, Input, message, Alert } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";

function ChangePassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [authRole] = useState(getItem("auth_role"));
    const [passwordVisible, setPasswordVisible] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const handleSubmit = async (values) => {
        // Validate that new password and confirm password match
        if (values.new_password !== values.new_password_confirmation) {
            message.error('New password and confirm password do not match!');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                old_password: values.old_password,
                new_password: values.new_password,
                new_password_confirmation: values.new_password_confirmation
            };

            const res = await DataService.post(`/${authRole}/profile/change-password`, payload);

            if (res.data.status) {
                message.success(res.data.message || 'Password changed successfully!');

                // Reset form
                form.resetFields();

                // Clear form values
                form.setFieldsValue({
                    old_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
            } else {
                throw new Error(res.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error("Password change error:", error);

            if (error.response) {
                // Handle server errors
                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Failed to change password';
                message.error(errorMessage);
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('Failed to change password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisible(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const passwordRules = [
        { required: true, message: 'Please input your password!' },
        { min: 8, message: 'Password must be at least 8 characters!' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must contain uppercase, lowercase & number!' }
    ];

    return (
        <>
            <PageHeader
                className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
                ghost
                title="Change Password"
            />

            <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={15}>
                    <Col xs={24}>
                        <div className="bg-white rounded-10 dark:bg-white10 p-[25px]">
                            <Alert
                                message="Password Requirements"
                                description="For security reasons, your new password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers."
                                type="info"
                                showIcon
                                className="mb-[30px] rounded-md border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                            />

                            <Form
                                className="mt-[25px]"
                                style={{ width: '100%' }}
                                layout="vertical"
                                form={form}
                                name="changePassword"
                                onFinish={handleSubmit}
                            >
                                {/* Current Password */}
                                <Row gutter={20}>
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                                            name="old_password"
                                            label="Current Password"
                                            rules={[{ required: true, message: 'Please enter your current password!' }]}
                                            hasFeedback
                                        >
                                            <Input.Password
                                                placeholder="Enter your current password"
                                                visibilityToggle={{
                                                    visible: passwordVisible.currentPassword,
                                                    onVisibleChange: () => togglePasswordVisibility('currentPassword')
                                                }}
                                                size="large"
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* New Password */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                                            name="new_password"
                                            label="New Password"
                                            rules={passwordRules}
                                            hasFeedback
                                            validateTrigger="onBlur"
                                        >
                                            <Input.Password
                                                placeholder="Enter new password"
                                                visibilityToggle={{
                                                    visible: passwordVisible.newPassword,
                                                    onVisibleChange: () => togglePasswordVisibility('newPassword')
                                                }}
                                                size="large"
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* Confirm Password */}
                                    <Col xs={24}>
                                        <Form.Item
                                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                                            name="new_password_confirmation"
                                            label="Confirm New Password"
                                            dependencies={['new_password']}
                                            rules={[
                                                { required: true, message: 'Please confirm your new password!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('new_password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('The two passwords do not match!'));
                                                    },
                                                }),
                                            ]}
                                            hasFeedback
                                        >
                                            <Input.Password
                                                placeholder="Confirm new password"
                                                visibilityToggle={{
                                                    visible: passwordVisible.confirmPassword,
                                                    onVisibleChange: () => togglePasswordVisibility('confirmPassword')
                                                }}
                                                size="large"
                                            />
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
                                            {loading ? 'Changing Password...' : 'Change Password'}
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

export default ChangePassword;