import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Select, DatePicker, message, Spin, Input } from 'antd';
import { Link, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from '../../config/dataService/dataService';
import { DragDrop } from '../../components/drag-drop/file';
import { getItem } from "../../utility/localStorageControl";

const { Option } = Select;
const { TextArea } = Input;

function EventEdit() {
  const { id } = useParams();
  const authRole = getItem("auth_role");

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    event: true,
    cities: false,
    categories: false,
    submitting: false
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [mobileThumbnail, setMobileThumbnail] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [mobileThumbnailUrl, setMobileThumbnailUrl] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    // Fetch all data first
    const fetchAllData = async () => {
      await fetchCities();
      await fetchCategories();
      await fetchEvent();
    };

    fetchAllData();
  }, [id]);

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

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await DataService.get('/categories');
      setCategories(response.data?.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchEvent = async () => {
    setLoading(prev => ({ ...prev, event: true }));
    try {
      const response = await DataService.get(`${authRole}/events/${id}/show`);
      const event = response.data?.event || response.data;

      if (event) {
        setEventData(event);
        setInitialData(event);

        // Set image URLs if they exist
        if (event.thumbnail) {
          const desktopImageUrl = event.thumbnail.startsWith('http')
            ? event.thumbnail
            : `${process.env.REACT_APP_API_ENDPOINT}/${event.thumbnail}`;
          setThumbnailUrl(desktopImageUrl);
        }

        if (event.mobile_thumbnail) {
          const mobileImageUrl = event.mobile_thumbnail.startsWith('http')
            ? event.mobile_thumbnail
            : `${process.env.REACT_APP_API_ENDPOINT}/${event.mobile_thumbnail}`;
          setMobileThumbnailUrl(mobileImageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      message.error('Failed to load event data');
    } finally {
      setLoading(prev => ({ ...prev, event: false }));
    }
  };

  // Find category ID by name
  const findCategoryIdByName = (categoryName) => {
    if (!categoryName || !categories.length) return null;

    // Try exact match first
    const exactMatch = categories.find(category =>
      category.name?.toLowerCase() === categoryName.toLowerCase()
    );

    if (exactMatch) return exactMatch.id;

    // Try partial match
    const partialMatch = categories.find(category =>
      category.name?.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(category.name?.toLowerCase())
    );

    if (partialMatch) return partialMatch.id;

    // Try other possible field names
    const fieldMatch = categories.find(category =>
      category.title?.toLowerCase() === categoryName.toLowerCase() ||
      category.category_name?.toLowerCase() === categoryName.toLowerCase()
    );

    return fieldMatch?.id || null;
  };

  // Update form when both initialData and cities are loaded
  useEffect(() => {
    if (initialData && cities.length > 0 && categories.length > 0) {
      console.log('Setting form values...');
      console.log('Event data:', initialData);
      console.log('Available cities:', cities);
      console.log('Available categories:', categories);
      console.log('Event category name:', initialData.event_category);

      // Find matching city
      let cityId = null;
      if (initialData.city) {
        const matchedCity = cities.find(c => c.name === initialData.city);

        if (matchedCity) {
          cityId = matchedCity.id;
        } else {
          // Try case-insensitive matching
          const matchedCityCaseInsensitive = cities.find(c =>
            c.name?.toLowerCase() === initialData.city?.toLowerCase()
          );

          if (matchedCityCaseInsensitive) {
            cityId = matchedCityCaseInsensitive.id;
          }
        }
      }

      // Find category ID by name
      const categoryId = findCategoryIdByName(initialData.event_category);
      console.log('Found category ID:', categoryId);

      // Format dates
      let startDateMoment = null;
      let endDateMoment = null;

      if (initialData.start_date) {
        const startDateStr = `${initialData.start_date} ${initialData.start_time || '00:00:00'}`;
        startDateMoment = moment(startDateStr, 'YYYY-MM-DD HH:mm:ss');
      }

      if (initialData.end_date) {
        const endDateStr = `${initialData.end_date} ${initialData.end_time || '23:59:59'}`;
        endDateMoment = moment(endDateStr, 'YYYY-MM-DD HH:mm:ss');
      }

      // Set all form values at once
      const formValues = {
        name: initialData.title,
        description: initialData.description,
        address: initialData.address,
        startDate: startDateMoment?.isValid() ? startDateMoment : null,
        endDate: endDateMoment?.isValid() ? endDateMoment : null,
        city: cityId,
      };

      // Only set category if we found a match
      if (categoryId) {
        formValues.eventCategoryId = categoryId;
      }

      console.log('Form values to set:', formValues);
      form.setFieldsValue(formValues);

      // If category wasn't found, show a warning
      if (initialData.event_category && !categoryId) {
        console.warn(`Category "${initialData.event_category}" not found in available categories`);
        message.warning(`Category "${initialData.event_category}" not found. Please select a new category.`);
      }
    }
  }, [initialData, cities, categories, form]);

  const handleSubmit = async (values) => {
    setLoading(prev => ({ ...prev, submitting: true }));

    try {
      const formData = new FormData();

      // Append files if they exist
      if (thumbnail) {
        formData.append('desktop_image', thumbnail);
      }
      if (mobileThumbnail) {
        formData.append('mobile_image', mobileThumbnail);
      }

      // Append form data
      formData.append('title', values.name.trim());
      formData.append('description', values.description.trim());
      formData.append('address', values.address.trim());

      // Append date and time
      formData.append('start_date', values.startDate.format('YYYY-MM-DD'));
      formData.append('end_date', values.endDate.format('YYYY-MM-DD'));
      formData.append('start_time', values.startDate.format('HH:mm:ss'));
      formData.append('end_time', values.endDate.format('HH:mm:ss'));
      formData.append('city_id', values.city);

      // Only append category if it exists
      if (values.eventCategoryId) {
        formData.append('event_category_id', values.eventCategoryId);
      }

      const response = await DataService.post(`/${authRole}/events/${id}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success('Event Updated Successfully!');

        // Refresh event data to show updated values
        fetchEvent();

        // Reset file states
        setThumbnail(null);
        setMobileThumbnail(null);

        setTimeout(() => {
          navigate(`/${authRole}/events`);
        }, 2000);
      } else {
        message.error('Failed to update event. Please try again.');
      }
    } catch (error) {
      console.error('Error updating event:', error);

      const errorMessage = error.response?.data?.message;
      if (errorMessage?.toLowerCase().includes('size')) {
        message.error('File size too large. Maximum 2MB allowed.');
      } else if (errorMessage?.toLowerCase().includes('image') || errorMessage?.toLowerCase().includes('format')) {
        message.error('Invalid image format. Please upload JPG, PNG, or GIF.');
      } else if (errorMessage?.toLowerCase().includes('not found') || errorMessage?.toLowerCase().includes('exist')) {
        message.error('Event not found or has been deleted.');
      } else {
        message.error(errorMessage || 'Failed to update event. Please check your inputs and try again.');
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleThumbnailUpload = (file) => {
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMobileThumbnailUpload = (file) => {
    setMobileThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMobileThumbnailUrl(e.target.result);
    };
    reader.readAsDataURL(file);
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
        buttons={[
          <Button
            className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
            size="default"
            key="1"
            type="primary"
          >
            <Link to={`/${authRole}/events`}>View All Events</Link>
          </Button>,
        ]}
        ghost
        title="Edit Event"
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
                name="eventEdit"
                onFinish={handleSubmit}
                initialValues={{
                  status: 'draft'
                }}
              >
                {/* Desktop Event Artwork */}
                <div className="mb-8">
                  <label className="font-semibold text-dark dark:text-white87 text-base mb-2 block">
                    Desktop Event Artwork*
                    <span className="block text-gray-500 text-sm font-normal mt-1">
                      Recommended size is 960 wide x 540 tall, 2 mb max
                    </span>
                  </label>
                  <DragDrop
                    onFileChange={handleThumbnailUpload}
                    label=""
                    description=""
                    required={false}
                    previewSize="h-[300px]"
                    initialPreview={thumbnailUrl}
                  />
                  {thumbnailUrl && !thumbnail && (
                    <p className="text-sm text-gray-500 mt-2">
                      Current image will be kept if no new file is uploaded
                    </p>
                  )}
                </div>

                {/* Mobile Event Artwork */}
                <div className="mb-8">
                  <label className="font-semibold text-dark dark:text-white87 text-base mb-2 block">
                    Mobile Event Artwork*
                    <span className="block text-gray-500 text-sm font-normal mt-1">
                      Recommended size is 706 wide x 706 tall, 2 mb max
                    </span>
                  </label>
                  <DragDrop
                    onFileChange={handleMobileThumbnailUpload}
                    label=""
                    description=""
                    required={false}
                    previewSize="h-[300px]"
                    initialPreview={mobileThumbnailUrl}
                  />
                  {mobileThumbnailUrl && !mobileThumbnail && (
                    <p className="text-sm text-gray-500 mt-2">
                      Current image will be kept if no new file is uploaded
                    </p>
                  )}
                </div>

                {/* Event Name */}
                <Form.Item
                  label="Event Name*"
                  name="name"
                  rules={[{ required: true, message: 'Please enter event name' }]}
                >
                  <Input
                    placeholder="Type event name"
                    className="h-[50px]"
                  />
                </Form.Item>

                {/* Event Category */}
                <Form.Item
                  label="Event Category*"
                  name="eventCategoryId"
                  rules={[{ required: true, message: 'Please select event category' }]}
                  extra={
                    initialData?.event_category && !form.getFieldValue('eventCategoryId') && (
                      <span className="text-orange-500 text-sm">
                        Note: Original category "{initialData.event_category}" not found in list. Please select a new category.
                      </span>
                    )
                  }
                >
                  <Select
                    loading={loading.categories}
                    placeholder="Select event category"
                    className="w-full h-[50px]"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name || category.title || category.category_name || `Category #${category.id}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

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

                {/* Event Information */}
                <Form.Item
                  label="Event Information*"
                  name="description"
                  rules={[{ required: true, message: 'Please enter event information' }]}
                >
                  <TextArea
                    placeholder="Type event information"
                    rows={4}
                    className="min-h-[120px]"
                  />
                </Form.Item>

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
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {cities.map((city) => (
                      <Option key={city.id} value={city.id}>
                        {city.name || city.city_name || city.title || `City #${city.id}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Event Venue Address */}
                <Form.Item
                  label="Event Venue Name Or Address*"
                  name="address"
                  rules={[{ required: true, message: 'Please enter event venue address' }]}
                >
                  <Input
                    placeholder="Type event venue name or address"
                    className="h-[50px]"
                  />
                </Form.Item>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-white10">
                  <Button
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 border-solid border-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                    size="default"
                    onClick={() => navigate(`/${authRole}/events`)}
                    disabled={loading.submitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn hover:shadow-lg transition-all duration-300 gap-[8px]"
                    size="default"
                    htmlType="submit"
                    type="primary"
                    loading={loading.submitting}
                  >
                    {loading.submitting ? 'Updating...' : 'Update Event'}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </main>
    </>
  );
}

export default EventEdit;