import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, Select, Upload, Spin, message, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import UilCamera from '@iconscout/react-unicons/icons/uil-camera';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from "../../config/dataService/dataService";
import { getItem, setItem } from "../../utility/localStorageControl";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

function EditProfile() {
    const [userData, setUserData] = useState(getItem("auth_user"));
    const [authRole, setAuthRole] = useState(getItem("auth_role"));
    const [form] = Form.useForm();
    const [adminForm] = Form.useForm();
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [state, setState] = useState({
        isLoading: false,
        isAdminLoading: false,
        isFileLoading: false,
        photoUrl: null,
        activeTab: 'profile', // Default tab
    });

    const isAdmin = authRole === 'admin';

    // Load cities on component mount
    useEffect(() => {
        loadCities();
    }, []);

    // Load cities from API
    const loadCities = async () => {
        setLoadingCities(true);
        try {
            const res = await DataService.get(`/cities`);
            if (res.data.status) {
                setCities(res.data.cities);
            }
        } catch (error) {
            console.error("Error loading cities:", error);
            message.error('Failed to load cities');
        } finally {
            setLoadingCities(false);
        }
    };

    // Initial user data from localStorage - for organizer/user form
    useEffect(() => {
        if (userData && cities.length > 0 && !isAdmin) {
            try {
                // Get city ID from user data
                let cityId = null;
                if (userData.city) {
                    const foundCity = cities.find(
                        (c) => c.name.toLowerCase() === userData.city.toLowerCase()
                    );

                    if (foundCity) {
                        cityId = foundCity.id;
                    }
                }

                // Set form values for organizer/user
                const formValues = {
                    type: userData.type || '',
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    username: userData.username || '',
                    facebook: userData.facebook || '',
                    twitter: userData.twitter || '',
                    linkedin: userData.linkedin || '',
                    zip_code: userData.zip_code || '',
                    address: userData.address || '',
                    details: userData.details || '',
                    designation: userData.designation || '',
                    city_id: cityId,
                };

                form.setFieldsValue(formValues);

                if (userData.photo) {
                    setState(prev => ({ ...prev, photoUrl: userData.photo }));
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                message.error('Failed to load user data');
            }
        }
    }, [form, userData, cities, isAdmin]);

    useEffect(() => {
        if (userData && isAdmin) {

            try {
                // Set form values for admin
                const adminFormValues = {
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    username: userData.username || '',
                    address: userData.address || '',
                    details: userData.details || '',
                };

                adminForm.setFieldsValue(adminFormValues);

                if (userData.photo) {
                    setState(prev => ({ ...prev, photoUrl: userData.photo }));
                }

            } catch (error) {
                console.error('Error parsing admin user data:', error);
                message.error('Failed to load admin user data');
            }
        }
    }, [adminForm, userData, isAdmin]);

    const handleSubmit = async (values) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Ensure city is sent as integer if it exists
            const updatedData = {
                ...values,
            };

            const res = await DataService.post(`/${authRole}/profile/update`, updatedData);
            if (res.data.status) {
                // Update localStorage with new data
                setItem('auth_user', res.data.user);
                setUserData(res.data.user);
                message.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error("Update error:", error);
            message.error('Failed to update profile');
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleAdminSubmit = async (values) => {
        setState(prev => ({ ...prev, isAdminLoading: true }));

        try {
            const res = await DataService.post(`/${authRole}/profile/update`, values);
            if (res.data.status) {
                // Update localStorage with new data
                setItem('auth_user', res.data.user);
                setUserData(res.data.user);
                message.success('Admin profile updated successfully!');
            }
        } catch (error) {
            console.error("Admin update error:", error);
            message.error('Failed to update admin profile');
        } finally {
            setState(prev => ({ ...prev, isAdminLoading: false }));
        }
    };

    const handlePhotoUpload = async (file) => {
        setState(prev => ({ ...prev, isFileLoading: true }));

        try {
            const formData = new FormData();
            formData.append('photo', file);

            // Upload photo to server with proper headers
            const response = await DataService.post(
                `/${authRole}/profile/upload-photo`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data && response.data.status) {
                // Update photo URL with server response
                setItem('auth_user', response.data.user);
                setUserData(response.data.user);
                setState(prev => ({ ...prev, isFileLoading: false }));

                message.success('Photo uploaded successfully');
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            console.error('Error details:', error.response?.data);
            message.error(error.response?.data?.message || 'Failed to upload photo');
            setState(prev => ({ ...prev, isFileLoading: false }));
        }
    };

    const uploadProps = {
        accept: "image/*",
        // showUploadList: false,
        multiple: false,

        beforeUpload: (file) => {
            handlePhotoUpload(file);
            return false;
        }
    };

    // Common Profile Photo Section Component
    const ProfilePhotoSection = () => (
        <Row gutter={20} className="mb-[30px]">
            <Col xs={24}>
                <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                    <figure className="relative flex items-center mb-[30px] gap-[20px]">
                        <img
                            className="max-w-[120px] min-w-[120px] min-h-[120px] rounded-full object-cover"
                            src={
                                state.photoUrl ||
                                userData?.photo ||
                                require('../../static/img/avatar/profileImage.png')
                            }
                            alt="Profile"
                        />
                        <figcaption>
                            <div className="absolute left-[80px] bottom-[-5px] w-[40px] h-[40px] bg-primary border-5 border-white dark:border-dark inline-flex items-center justify-center rounded-full z-[222] shadow-btn [&>span]:flex [&>span]:items-center">
                                <Upload {...uploadProps}>
                                    <div className="flex items-center justify-center text-white dark:text-white8 cursor-pointer">
                                        {state.isFileLoading ? (
                                            <Spin
                                                size="small"
                                                className="!text-white"
                                                spinning={true}
                                            />
                                        ) : (
                                            <UilCamera className="w-[22px] h-[22px] text-white" />
                                        )}
                                    </div>
                                </Upload>
                            </div>
                        </figcaption>
                    </figure>
                    <div>
                        <h4 className="text-[18px] font-semibold mb-1 text-dark dark:text-white87">Profile Photo</h4>
                        <p className="text-[14px] text-gray-600 dark:text-white60 mb-2">
                            Click the camera icon to upload a new profile picture
                        </p>
                    </div>
                </div>
            </Col>
        </Row>
    );

    // Admin Form Fields based on validation rules
    const AdminFormContent = () => (
        <Form
            className="mt-[25px]"
            style={{ width: '100%' }}
            layout="vertical"
            form={adminForm}
            name="editAdminProfile"
            onFinish={handleAdminSubmit}
        >
            {/* Profile Photo Section */}
            <ProfilePhotoSection />

            {/* Personal Information Section */}
            <div className="mb-[30px]">
                <Row gutter={20}>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="first_name"
                            label="First Name"
                            rules={[{ required: true, message: 'Please enter your first name' }]}
                        >
                            <Input placeholder="Enter your first name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="last_name"
                            label="Last Name"
                            rules={[{ required: true, message: 'Please enter your last name' }]}
                        >
                            <Input placeholder="Enter your last name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input placeholder="example@gmail.com" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="phone"
                            label="Phone Number"
                            rules={[
                                {
                                    pattern: /^\+?[0-9]{1,4}?[-. ]?(\(?\d{1,4}?\)?[-. ]?)?[\d\s\-\(\)]{3,}$/,
                                    message: 'Please enter a valid phone number'
                                }
                            ]}
                        >
                            <Input placeholder="+1 234 567 8900" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Please enter a username' }]}
                        >
                            <Input placeholder="username" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                            name="address"
                            label="Address"
                            rules={[{ max: 500, message: 'Address cannot exceed 500 characters' }]}
                        >
                            <TextArea
                                placeholder="Enter your address"
                                rows={2}
                                maxLength={500}
                                showCount
                                className="border-normal dark:border-white10 border-1 rounded-md"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                            name="details"
                            label="About/Bio"
                            rules={[{ max: 1000, message: 'Bio cannot exceed 1000 characters' }]}
                        >
                            <TextArea
                                placeholder="Tell us about yourself, your experience, or anything you'd like to share..."
                                rows={4}
                                maxLength={1000}
                                showCount
                                className="border-normal dark:border-white10 border-1 rounded-md"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Form Actions */}
            <Row gutter={20} className="mt-[40px] pt-[25px] border-t border-gray-200 dark:border-white10">
                <Col xs={24} className="flex justify-end gap-[15px]">
                    <Button
                        className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-md px-[24px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                        size="default"
                        htmlType="submit"
                        type="primary"
                        loading={state.isAdminLoading}
                    >
                        {state.isAdminLoading ? 'Saving Changes...' : 'Save All Changes'}
                    </Button>
                </Col>
            </Row>
        </Form>
    );

    // Original Form for Organizer/User
    const OrganizerFormContent = () => (
        <Form
            className="mt-[25px]"
            style={{ width: '100%' }}
            layout="vertical"
            form={form}
            name="editProfile"
            onFinish={handleSubmit}
        >
            {/* Profile Photo Section */}
            <ProfilePhotoSection />

            {/* Personal Information Section */}
            <div className="mb-[30px]">
                <h3 className="text-[18px] font-semibold mb-[20px] text-dark dark:text-white87 pb-2 border-b border-gray-200 dark:border-white10">
                    Personal Information
                </h3>
                <Row gutter={20}>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                            <Input placeholder="Enter your full name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input placeholder="example@gmail.com" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="phone"
                            label="Phone Number"
                        >
                            <Input placeholder="+1 234 567 8900" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="designation"
                            label="Designation"
                        >
                            <Input placeholder="e.g., Software Engineer, Product Manager" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Please enter a username' }]}
                        >
                            <Input placeholder="username" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="type"
                            label="User Type"
                            rules={[{ required: true, message: 'Please select user type' }]}
                        >
                            <Select
                                className="[&>div]:border-normal dark:[&>div]:border-white10 [&>div]:rounded-md [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white60 [&>div>div>div>span]:bg-transparent [&>div]:h-[50px] [&>div>div>div>span]:items-center w-full [&>div>.ant-select-selection-item]:flex [&>div>.ant-select-selection-item]:items-center dark:[&>div>.ant-select-selection-item]:text-white60"
                                placeholder="Select User Type"
                            >
                                <Option value="individual">Individual</Option>
                                <Option value="company">Company</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Address Information Section */}
            <div className="mb-[30px]">
                <h3 className="text-[18px] font-semibold mb-[20px] text-dark dark:text-white87 pb-2 border-b border-gray-200 dark:border-white10">
                    Address Information
                </h3>
                <Row gutter={20}>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                            name="city_id"
                            label="City"
                        >
                            <Select
                                className="[&>div]:border-normal dark:[&>div]:border-white10 [&>div]:rounded-md [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white60 [&>div>div>div>span]:bg-transparent [&>div]:h-[50px] [&>div>div>div>span]:items-center w-full [&>div>.ant-select-selection-item]:flex [&>div>.ant-select-selection-item]:items-center dark:[&>div>.ant-select-selection-item]:text-white60"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                loading={loadingCities}
                                placeholder="Select a city"
                                notFoundContent={cities.length === 0 ? "No cities available" : null}
                                allowClear
                            >
                                {cities.map(city => (
                                    <Option key={city.id} value={city.id}>
                                        {city.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="zip_code"
                            label="Zip/Postal Code"
                        >
                            <Input placeholder="Enter zip or postal code" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                            name="address"
                            label="Full Address"
                        >
                            <TextArea
                                placeholder="Enter your full address"
                                rows={2}
                                className="border-normal dark:border-white10 border-1 rounded-md"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Social Media Links Section */}
            <div className="mb-[30px]">
                <h3 className="text-[18px] font-semibold mb-[20px] text-dark dark:text-white87 pb-2 border-b border-gray-200 dark:border-white10">
                    Social Media Links
                </h3>
                <Row gutter={20}>
                    <Col xs={24} md={8} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="facebook"
                            label="Facebook"
                        >
                            <Input placeholder="https://facebook.com/username" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="twitter"
                            label="Twitter"
                        >
                            <Input placeholder="https://twitter.com/username" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold [&>.ant-form-item-row>div>div>div>input]:border-normal dark:[&>.ant-form-item-row>div>div>div>input]:text-white60 dark:[&>.ant-form-item-row>div>div>div>input]:border-white10 [&>.ant-form-item-row>div>div>div>input]:rounded-md"
                            name="linkedin"
                            label="LinkedIn"
                        >
                            <Input placeholder="https://linkedin.com/in/username" />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Additional Details Section */}
            <div className="mb-[30px]">
                <h3 className="text-[18px] font-semibold mb-[20px] text-dark dark:text-white87 pb-2 border-b border-gray-200 dark:border-white10">
                    Additional Information
                </h3>
                <Row gutter={20}>
                    <Col xs={24} className="mb-[15px]">
                        <Form.Item
                            className="[&>.ant-form-item-row]:flex-col [&>.ant-form-item-row>div]:text-start [&>.ant-form-item-row>div>label]:text-dark dark:[&>.ant-form-item-row>div]:text-start dark:[&>.ant-form-item-row>div>label]:text-white87 [&>.ant-form-item-row>div>label]:font-semibold"
                            name="details"
                            label="About/Bio"
                        >
                            <TextArea
                                placeholder="Tell us about yourself, your experience, or anything you'd like to share..."
                                rows={4}
                                className="border-normal dark:border-white10 border-1 rounded-md"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Form Actions */}
            <Row gutter={20} className="mt-[40px] pt-[25px] border-t border-gray-200 dark:border-white10">
                <Col xs={24} className="flex justify-end gap-[15px]">
                    <Button
                        className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-md px-[24px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                        size="default"
                        htmlType="submit"
                        type="primary"
                        loading={state.isLoading}
                    >
                        {state.isLoading ? 'Saving Changes...' : 'Save All Changes'}
                    </Button>
                </Col>
            </Row>
        </Form>
    );

    return (
        <>
            <PageHeader
                className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
                ghost
                title={`Edit Profile - ${isAdmin ? 'Admin' : authRole === 'organizer' ? 'Organizer' : 'User'}`}
            />
            <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={15}>
                    <Col xs={24}>
                        <div className="bg-white rounded-10 dark:bg-white10 p-[25px]">
                            {isAdmin ? (
                                <AdminFormContent />
                            ) : (
                                <OrganizerFormContent />
                            )}
                        </div>
                    </Col>
                </Row>
            </main>
        </>
    );
}

export default EditProfile;