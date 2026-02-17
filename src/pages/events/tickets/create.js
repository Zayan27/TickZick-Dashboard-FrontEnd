import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, InputNumber, message, Select, Spin } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Button as CustomButton } from '../../../components/buttons/buttons';
import { DataService } from '../../../config/dataService/dataService';
import { getItem } from "../../../utility/localStorageControl";

const { Option } = Select;
const { TextArea } = Input;

function TicketCreate() {
  const authRole = getItem("auth_role");
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const eventId = params.get('event_id');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    event: false,
    submitting: false
  });
  const [event, setEvent] = useState(null);
  const [pricingType, setPricingType] = useState('paid');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    } else {
      message.error('Event ID is required to create a ticket');
      navigate(`/${authRole}/events/show/${eventId}`);
    }
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(prev => ({ ...prev, event: true }));
    try {
      const response = await DataService.get(`/${authRole}/events/${eventId}/show`);
      const eventData = response.data?.event || response.data;

      if (eventData) {
        setEvent(eventData);
      } else {
        message.error('Event not found');
        navigate(`/${authRole}/events/show/${eventId}`);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      message.error(error.response?.data?.message || 'Failed to load event details');
      navigate(`/${authRole}/events/show/${eventId}`);
    } finally {
      setLoading(prev => ({ ...prev, event: false }));
    }
  };

  const onFinish = async (values) => {
    // Basic validation
    if (!values.name || values.name.trim() === '') {
      message.error('Please enter ticket name');
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));

    try {
      const payload = {
        event_id: eventId,
        title: values.name,
        description: values.description || null,
        refund_policy: values.refund_policy || null,
        pricing_type: values.pricing_type || 'paid',
        price: values.price || 0,
        ticket_available: values.quantity || null,
        sales_status: values.sales_status || 'inactive',
      };

      const response = await DataService.post(`/${authRole}/tickets/create`, payload);

      if (response.status === 200 || response.status === 201) {
        message.success('Ticket Created Successfully!');

        // Reset form
        form.resetFields();

        // Auto-navigate to event tickets list after 2 seconds
        setTimeout(() => {
          navigate(`/${authRole}/events/show/${eventId}`);
        }, 2000);
      } else {
        message.error(response.data?.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      console.error('Error message:', error.response?.data?.message)
      
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handlePricingTypeChange = (value) => {
    setPricingType(value);
    if (value === 'free') {
      form.setFieldsValue({ price: 0 });
    }
  };

  if (loading.event) {
    return (
      <div className="min-h-[715px] lg:min-h-[580px] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
        ghost
        title={event ? `Create Ticket: ${event.name || event.title || 'Event'}` : 'Create New Ticket'}
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
                name="ticketCreate"
                onFinish={onFinish}
                initialValues={{
                  pricing_type: 'paid',
                  quantity: 100
                }}
              >
                {/* Event ID (hidden field) */}
                <Form.Item name="event_id" initialValue={eventId} hidden>
                  <Input />
                </Form.Item>

                {/* Ticket Name */}
                <Form.Item
                  label="Ticket Name*"
                  name="name"
                  rules={[{ required: true, message: 'Please enter ticket name' }]}
                >
                  <Input
                    placeholder="Enter ticket name (e.g., General Admission, VIP Pass)"
                    className="w-full h-[50px]"
                  />
                </Form.Item>

                {/* Ticket Description */}
                <Form.Item
                  label="Description"
                  name="description"
                >
                  <TextArea
                    placeholder="Enter ticket description (optional)"
                    rows={4}
                    className="w-full"
                  />
                </Form.Item>

                {/* Pricing Type and Price */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Pricing Type*"
                      name="pricing_type"
                      rules={[{ required: true, message: 'Please select pricing type' }]}
                    >
                      <Select
                        placeholder="Select pricing type"
                        className="w-full h-[50px]"
                        onChange={handlePricingTypeChange}
                      >
                        <Option value="free">Free</Option>
                        <Option value="paid">Paid</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Price (Rs)*"
                      name="price"
                      rules={[
                        {
                          required: pricingType === 'paid',
                          message: 'Please enter price for paid tickets'
                        },
                        {
                          validator: (_, value) => {
                            if (pricingType === 'paid' && (value === undefined || value === null || value <= 0)) {
                              return Promise.reject(new Error('Price must be greater than 0'));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <InputNumber
                        placeholder="Enter price"
                        className="w-full h-[40px]"
                        min={0}
                        step={0.01}
                        precision={2}
                        disabled={pricingType === 'free'}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Quantity */}
                <Form.Item
                  label="Available Quantity*"
                  name="quantity"
                  rules={[
                    { required: true, message: 'Please enter available quantity' },
                    { type: 'number', min: 1, message: 'Quantity must be at least 1' }
                  ]}
                >
                  <InputNumber
                    placeholder="Enter available ticket quantity"
                    className="w-full h-[40px]"
                    min={1}
                  />
                </Form.Item>

                {/* Refund Policy */}
                <Form.Item
                  label="Refund Policy"
                  name="refund_policy"
                >
                  <TextArea
                    placeholder="Enter refund policy details (optional)"
                    rows={3}
                    className="w-full"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Status*"
                      name="sales_status"
                      rules={[{ required: true, message: 'Please select status' }]}
                    >
                      <Select
                        placeholder="Select Status"
                        className="w-full h-[50px]"
                      >
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-white10">
                  <CustomButton
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 border-solid border-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                    size="default"
                    onClick={() => navigate(`/${authRole}/events/show/${eventId}`)}
                    disabled={loading.submitting}
                  >
                    Cancel
                  </CustomButton>

                  <CustomButton
                    className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
                    size="default"
                    htmlType="submit"
                    type="primary"
                    loading={loading.submitting}
                  >
                    {loading.submitting ? 'Creating...' : 'Create Ticket'}
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

export default TicketCreate;