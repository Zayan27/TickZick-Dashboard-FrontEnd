// EventCreate.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Select, DatePicker, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button as CustomButton } from '../../components/buttons/buttons';
import { DataService } from '../../config/dataService/dataService';
import { DragDrop } from '../../components/drag-drop/file';
import { MultiLangInput } from '../../components/multilang-fields/input';
import { MultiLangTextarea } from '../../components/multilang-fields/textarea';
import { getItem } from "../../utility/localStorageControl";

const { Option } = Select;

function EventCreate() {
  const authRole = getItem("auth_role");

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    countries: false,
    cities: false,
    submitting: false
  });
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [mobileThumbnail, setMobileThumbnail] = useState(null);

  // Multi-language states
  const [title, setTitle] = useState({});
  const [description, setDescription] = useState({});
  const [address, setAddress] = useState({});

  useEffect(() => {
    fetchCountries();
    fetchCities();
  }, []);

  const fetchCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    try {
      const response = await DataService.get('/countries');
      setCountries(response.data?.countries || []);
    } catch (error) {
      message.error('Failed to load countries');
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchCities = async () => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const response = await DataService.get('/cities');
      setCities(response.data?.cities || []);
    } catch (error) {
      message.error('Failed to load cities');
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const validateMultiLang = (values) => {
    // Check if at least one language has content
    return Object.values(values).some(value => value && value.trim() !== '');
  };

  const handleSubmit = async (values) => {
    // Validate required files
    if (!thumbnail || !mobileThumbnail) {
      message.error('Please upload both desktop and mobile event artwork');
      return;
    }

    if (!values.startDate || !values.endDate) {
      message.error('Please select both start and end dates');
      return;
    }

    if (values.startDate && values.endDate && values.startDate > values.endDate) {
      message.error('End date cannot be before start date');
      return;
    }

    // Validate that at least one language has title
    const hasTitle = validateMultiLang(title);
    if (!hasTitle) {
      message.error('Please enter event name in at least one language');
      return;
    }

    // Validate that at least one language has description
    const hasDescription = validateMultiLang(description);
    if (!hasDescription) {
      message.error('Please enter event information in at least one language');
      return;
    }

    // Validate that at least one language has address
    const hasAddress = validateMultiLang(address);
    if (!hasAddress) {
      message.error('Please enter event venue address in at least one language');
      return;
    }

    if (!values.city) {
      message.error('Please select a city');
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));

    try {
      const formData = new FormData();

      // Append files
      formData.append('desktop_image', thumbnail);
      formData.append('mobile_image', mobileThumbnail);

      // Append multi-language fields
      Object.entries(title).forEach(([language, value]) => {
        if (value && value.trim() !== '') {
          formData.append(`name[${language}][value]`, value.trim());
        }
      });

      Object.entries(description).forEach(([language, value]) => {
        if (value && value.trim() !== '') {
          formData.append(`description[${language}][value]`, value.trim());
        }
      });

      Object.entries(address).forEach(([language, value]) => {
        if (value && value.trim() !== '') {
          formData.append(`address[${language}][value]`, value.trim());
        }
      });

      // Append other data
      formData.append('start_date', values.startDate.format('YYYY-MM-DD'));
      formData.append('end_date', values.endDate.format('YYYY-MM-DD'));

      // Extract time from DatePicker if available, otherwise use default
      const startTime = values.startDate ? values.startDate.format('HH:mm:ss') : '00:00:00';
      const endTime = values.endDate ? values.endDate.format('HH:mm:ss') : '23:59:59';
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);

      formData.append('city_id', values.city);
      formData.append('status', 'draft');

      const response = await DataService.post(`/${authRole}/events/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Show success message
        message.success('Event Created Successfully!');
        
        // Reset form after successful creation
        form.resetFields();
        setThumbnail(null);
        setMobileThumbnail(null);
        setTitle({});
        setDescription({});
        setAddress({});
        
        // Auto-navigate to events list after 2 seconds
        setTimeout(() => {
          navigate(`${authRole}/events`);
        }, 2000);
      } else {
        message.error('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Enhanced error handling
      const errorMessage = error.response?.data?.message;
      if (errorMessage?.toLowerCase().includes('size')) {
        message.error('File size too large. Maximum 2MB allowed.');
      } else if (errorMessage?.toLowerCase().includes('image') || errorMessage?.toLowerCase().includes('format')) {
        message.error('Invalid image format. Please upload JPG, PNG, or GIF.');
      } else {
        message.error(errorMessage || 'Failed to create event. Please check your inputs and try again.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <>
      <PageHeader
        className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
        buttons={[
          <CustomButton
            className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
            size="default"
            key="1"
            type="primary"
          >
            <Link to={`/${authRole}/events`}>View All Events</Link>
          </CustomButton>,
        ]}
        ghost
        title="Create New Event"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Row gutter={15}>
          <Col xs={24}>
            <div className="bg-white rounded-10 dark:bg-white10 p-[25px]">
              <Form
                className="mt-[25px]"
                style={{ width: '100%' }}
                layout="vertical"
                form={form}
                name="eventCreate"
                onFinish={handleSubmit}
              >
                {/* Desktop Event Artwork */}
                <DragDrop
                  onFileChange={setThumbnail}
                  label="Desktop Event Artwork"
                  description="Recommended size is 960 wide x 540 tall, 2 mb max"
                  required={true}
                  previewSize="h-[300px]"
                />

                {/* Mobile Event Artwork */}
                <DragDrop
                  onFileChange={setMobileThumbnail}
                  label="Mobile Event Artwork"
                  description="Recommended size is 706 wide x 706 tall, 2 mb max"
                  required={true}
                  previewSize="h-[300px]"
                />

                {/* Event Name - Multi-language */}
                <MultiLangInput
                  label="Event Name"
                  placeholder="Type event name"
                  required={true}
                  value={title}
                  onChange={setTitle}
                />

                {/* Date and Time Range */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Start Date & Time*"
                      name="startDate"
                      rules={[{ required: true, message: 'Please select start date and time' }]}
                    >
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        className="w-full h-[50px]"
                        placeholder="Select start date and time"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="End Date & Time*"
                      name="endDate"
                      rules={[{ required: true, message: 'Please select end date and time' }]}
                    >
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        className="w-full h-[50px]"
                        placeholder="Select end date and time"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Event Information - Multi-language */}
                <MultiLangTextarea
                  label="Event Information"
                  placeholder="Type event information"
                  required={true}
                  rows={4}
                  value={description}
                  onChange={setDescription}
                />

                {/* City Selection */}
                <Form.Item
                  label="City*"
                  name="city"
                  rules={[{ required: true, message: 'Please select a city' }]}
                >
                  <Select
                    loading={loading.cities}
                    placeholder="Select city"
                    className="w-full h-[50px]"
                  >
                    {cities.map((city) => (
                      <Option key={city.id} value={city.id}>
                        {city.name || city.city_name || city.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Event Venue Address - Multi-language */}
                <MultiLangInput
                  label="Event Venue Name Or Address"
                  placeholder="Type event venue name or address"
                  required={true}
                  value={address}
                  onChange={setAddress}
                />

                <div className="text-end record-form-actions mt-8">
                  <CustomButton
                    className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
                    size="default"
                    htmlType="submit"
                    type="primary"
                    loading={loading.submitting}
                  >
                    {loading.submitting ? 'Creating...' : 'Create Event'}
                  </CustomButton>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </main>
    </>
  );
}

export default EventCreate;