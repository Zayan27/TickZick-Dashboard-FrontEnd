import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Table, Spin, message, Tag, Button as AntButton, Divider, Statistic, Descriptions, Space, Tabs, Image, Badge } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";
import { GlobalUtilityStyle, PaginationStyle } from '../../container/styled';
import {
  UilCalendarAlt,
  UilMapMarker,
  UilUsersAlt,
  UilTicket,
  UilEdit,
  UilTrash,
  UilDollarSign,
  UilPhone,
  UilEnvelope,
  UilGlobe,
  UilFacebook,
  UilTwitter,
  UilHeart,
  UilHeartBreak,
  UilUnlock,
  UilLock
} from '@iconscout/react-unicons';

const { TabPane } = Tabs;

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    soldTickets: 0,
    availableTickets: 0,
    totalRevenue: 0
  });

  const user = getItem("auth_user");
  const authRole = getItem("auth_role");
  const isOrganizer = authRole === 'organizer';

  // Load event details
  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const res = await DataService.get(`/${authRole}/events/${id}/show`);
      if (res.data) {
        setEvent(res.data.event);
        calculateTicketStats(res.data.event.tickets || []);
      } else {
        throw new Error('Event not found');
      }
    } catch (error) {
      console.error("Event fetch error:", error);
      message.error(error?.response?.data?.message || 'Failed to load event details');
      navigate(`/${authRole}/events`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ticket statistics
  const calculateTicketStats = (ticketsList) => {
    let totalTickets = 0;
    let soldTickets = 0;
    let availableTickets = 0;
    let totalRevenue = 0;

    ticketsList.forEach(ticket => {
      const quantity = ticket.ticket_available || 0;
      const price = parseFloat(ticket.price) || 0;
      const sold = ticket.ticket_sold || 0;

      totalTickets += quantity;
      soldTickets += sold;
      availableTickets += (quantity - sold);
      totalRevenue += (sold * price);
    });

    setStats({
      totalTickets,
      soldTickets,
      availableTickets,
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    });
  };

  useEffect(() => {
    if (id) {
      loadEventDetails();
    }
  }, [id, authRole]);

  const handleEventStatus = async (newStatus) => {
    try {
      await DataService.post(`/${authRole}/events/${id}/status`, {
        status: newStatus
      });

      message.success("Event status updated successfully");
      loadEventDetails();
    } catch (error) {
      console.error("Status update error:", error);
      message.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await DataService.post(`/${authRole}/tickets/${ticketId}/delete`);
      message.success('Ticket deleted successfully');
      loadEventDetails();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(error?.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This will also delete all associated tickets.")) return;

    try {
      await DataService.post(`/${authRole}/events/${id}/delete`);
      message.success('Event deleted successfully');
      navigate(`/${authRole}/events`);
    } catch (error) {
      console.error("Delete event error:", error);
      message.error(error?.response?.data?.message || 'Failed to delete event');
    }
  };

  // Format date and time
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    return formattedDate;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case '1':
        return 'green';
      case '0':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '1':
        return 'Published';
      case '0':
        return 'Draft';
      default:
        return 'blue';
    }
  };

  // Ticket table columns for Organizer
  const organizerTicketColumns = [
    {
      title: 'Ticket Name',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-dark dark:text-white87">{text}</div>
            <div className="text-xs text-gray-500 dark:text-white60">
              {record.description && (
                <div className="mt-1 line-clamp-1">{record.description}</div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type/Price',
      key: 'price_type',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-dark dark:text-white87">
            <span className="font-mono">{record.price > 0 ? 'Rs' : ''}</span>{record.price === 0 || record.price === '0.00' ? 'Free' : `${parseFloat(record.price).toFixed(2)}`}
          </div>
          <div className="text-xs text-gray-500 dark:text-white60 mt-1">
            {record.pricing_type}
          </div>
        </div>
      ),
    },
    {
      title: 'Available',
      dataIndex: 'ticket_available',
      key: 'available',
      render: (available, record) => (
        <div>
          <Tag color={available > 0 ? 'green' : 'red'}>
            {available || 0}
          </Tag>
          <div className="text-xs text-gray-500 dark:text-white60 mt-1">
            Sold: {record.ticket_sold || 0}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'sales_status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Refundable',
      dataIndex: 'is_refund_policy',
      key: 'refundPolicy',
      render: (isRefundPolicy) => (
        <Tag color={isRefundPolicy ? 'blue' : 'gray'}>
          {isRefundPolicy ? 'Refundable' : 'Non-refundable'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-3 justify-start">
          <Link
            className="text-primary hover:text-primary-dark"
            to={`/${authRole}/tickets/edit/${record.id}`}
            title="Edit Ticket"
          >
            <UilEdit className="w-4 h-4" />
          </Link>
          <button
            className="text-danger hover:text-danger-dark"
            onClick={() => handleDeleteTicket(record.id)}
            title="Delete Ticket"
          >
            <UilTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Ticket table columns for Non-Organizer (View Only)
  const nonOrganizerTicketColumns = [
    {
      title: 'Ticket Type',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex items-start gap-3">
          <div>
            <div className="font-semibold text-lg text-dark dark:text-white87">{text}</div>
            {record.description && (
              <div className="text-sm text-gray-600 dark:text-white60 mt-1">
                {record.description}
              </div>
            )}
            {record.pricing_type && (
              <div className="text-xs text-gray-500 dark:text-white60 mt-1">
                Type: {record.pricing_type}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      width: '120px',
      render: (_, record) => (
        <div className="text-center">
          <div className={`text-2xl font-bold ${record.price === 0 || record.price === '0.00' ? 'text-green-600' : 'text-primary'}`}>
            {record.price === 0 || record.price === '0.00' ? 'FREE' : `Rs ${parseFloat(record.price).toFixed(2)}`}
          </div>
          <div className="text-xs text-gray-500 dark:text-white60 mt-1">
            per ticket
          </div>
        </div>
      ),
    },
    {
      title: 'Availability',
      key: 'availability',
      width: '140px',
      render: (_, record) => {
        const available = record.ticket_available || 0;
        const sold = record.ticket_sold || 0;
        const total = available + sold;
        const percentageSold = total > 0 ? Math.round((sold / total) * 100) : 0;

        return (
          <div>
            <div className="mb-2">
              <Badge
                count={`${available} available`}
                style={{
                  backgroundColor: available > 0 ? '#52c41a' : '#f5222d',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              />
            </div>
            {total > 0 && (
              <div className="w-full bg-gray-200 dark:bg-white20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${percentageSold}%` }}
                ></div>
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-white60 mt-1 text-center">
              {sold} sold
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'sales_status',
      key: 'status',
      width: '100px',
      render: (status) => (
        <Tag
          color={status === 'active' ? 'green' : 'red'}
          className="px-3 py-1 font-medium"
        >
          {status === 'active' ? 'ON SALE' : 'SOLD OUT'}
        </Tag>
      ),
    },
  ];

  // Prepare ticket data for table
  const ticketDataSource = (event?.tickets || []).map((ticket) => ({
    key: ticket.id,
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    price: ticket.price,
    pricing_type: ticket.pricing_type,
    ticket_available: ticket.ticket_available,
    ticket_sold: ticket.ticket_sold,
    sales_status: ticket.sales_status,
    is_refund_policy: ticket.is_refund_policy,
    refund_policy: ticket.refund_policy,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-dark dark:text-white87 mb-4">
          Event Not Found
        </h2>
        <Button
          type="primary"
          onClick={() => navigate(`/${authRole}/events`)}
        >
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        className="flex items-center justify-between px-[30px] py-[25px] bg-transparent"
        ghost
        title={
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-dark dark:text-white87 mb-1">
                {event.title || `Event #${event.id}`}
              </h1>
              <p className="text-gray-500 dark:text-white60 text-sm">
                Slug: {event.slug}
              </p>
            </div>
          </div>
        }
        buttons={isOrganizer ? [
          <Space key="actions" size="middle">
            <Link to={`/${authRole}/tickets/create?event_id=${id}`}>
              <Button type="primary" size="default" title="Create Ticket">
                <UilTicket className="w-4 h-4" />
              </Button>
            </Link>

            <Link to={`/${authRole}/events/edit/${id}`}>
              <Button type="default" size="default" title="Edit Event">
                <UilEdit className="w-4 h-4" />
              </Button>
            </Link>

            <AntButton danger onClick={handleDeleteEvent} title="Delete Event">
              <UilTrash className="w-4 h-4" />
            </AntButton>
          </Space>
        ] : [
          <Space key="actions" size="middle">

            {event.status === '1' ? (
              <AntButton
                type="default"
                onClick={() => handleEventStatus('0')}
                title="Block Event"
              >
                <UilLock className="w-4 h-4" />
              </AntButton>
            ) : (
              <AntButton
                type="primary"
                onClick={() => handleEventStatus('1')}
                title="Unblock Event"
              >
                <UilUnlock className="w-4 h-4" />
              </AntButton>
            )}

          </Space>
        ]}

      />

      <div className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* Event Overview */}
        <Row gutter={[20, 20]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card className="rounded-[10px]">
              <div className="flex flex-col lg:flex-row gap-6">
                {event.thumbnail && (
                  <div className="w-full lg:w-1/3">
                    <Image
                      src={event.thumbnail}
                      alt={event.title}
                      className="rounded-lg object-cover w-full h-64 lg:h-auto"
                      preview={false}
                    />
                    {event.mobile_thumbnail && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-white60 mb-2">Mobile Thumbnail:</p>
                        <Image
                          src={event.mobile_thumbnail}
                          alt={`${event.title} - Mobile`}
                          className="rounded-lg object-cover w-full h-32"
                          preview={false}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-dark dark:text-white87">
                        {event.title}
                      </h2>
                      <p className="text-gray-500 dark:text-white60 mt-1">
                        Organized by: {event.organizer}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Tag color={getStatusColor(event.status)} className="text-sm font-medium">
                        {getStatusText(event.status)}
                      </Tag>
                      {event.is_featured && (
                        <Tag color="gold" className="text-sm font-medium">
                          FEATURED
                        </Tag>
                      )}
                      {event.is_favourite !== undefined && (
                        <Tag
                          color={event.is_favourite ? 'red' : 'gray'}
                          icon={event.is_favourite ? <UilHeart /> : <UilHeartBreak />}
                          className="text-sm font-medium"
                        >
                          {event.is_favourite ? 'Favourite' : 'Not Favourite'}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <div className="mb-6">
                      <p className="text-gray-600 dark:text-white60 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <UilCalendarAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-white60">Date & Time</div>
                          <div className="font-medium text-dark dark:text-white87">
                            {formatDateTime(event.start_date, event.start_time)}
                            {event.end_date && (
                              <>
                                <div className="text-sm text-gray-500 dark:text-white60 mt-1">to</div>
                                {formatDateTime(event.end_date, event.end_time)}
                              </>
                            )}
                          </div>
                          {event.duration && (
                            <div className="text-xs text-gray-500 dark:text-white60 mt-1">
                              Duration: {event.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} sm={12}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <UilMapMarker className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-white60">Location</div>
                          <div className="font-medium text-dark dark:text-white87">
                            {event?.address && (
                              <div>{event.address}</div>
                            )}
                            {(() => {
                              const parts = [
                                event?.city || "",
                                event?.state || "",
                                event?.country || ""
                              ].filter(Boolean);

                              return parts.length > 0 ? (
                                <div>{parts.join(", ")}</div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>

          {/* Statistics */}
          <Col xs={24} lg={8}>
            <Card className="rounded-[10px] h-full">
              <h3 className="text-lg font-semibold text-dark dark:text-white87 mb-6">
                Event Statistics
              </h3>

              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Statistic
                      title="Total Tickets"
                      value={stats.totalTickets}
                      prefix={<UilTicket className="w-4 h-4 mr-1" />}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Statistic
                      title="Sold"
                      value={stats.soldTickets}
                      prefix={<UilUsersAlt className="w-4 h-4 mr-1" />}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Statistic
                      title="Available"
                      value={stats.availableTickets}
                      prefix={<UilTicket className="w-4 h-4 mr-1" />}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Statistic
                      title="Revenue"
                      value={stats.totalRevenue}
                      prefix={<UilDollarSign className="w-4 h-4 mr-1" />}
                      valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                      suffix="USD"
                    />
                  </div>
                </Col>
              </Row>

              <Divider className="my-6" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white60">Event Type:</span>
                  <span className="font-medium">{event.event_type || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white60">Category:</span>
                  <span className="font-medium">{event.event_category || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white60">Organizer Type:</span>
                  <span className="font-medium">{event.organizer_type || 'Individual'}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabs Section */}
        <Tabs defaultActiveKey="tickets" className="bg-white dark:bg-white10 rounded-[10px] p-5">
          <TabPane tab="Tickets" key="tickets">
            {isOrganizer ? (
              // Organizer View
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-dark dark:text-white87">
                    Event Tickets ({ticketDataSource.length})
                  </h3>
                  <Link to={`/${authRole}/tickets/create?event_id=${id}`}>
                    <Button type="primary">
                      Add New Ticket
                    </Button>
                  </Link>
                </div>

                {ticketDataSource.length > 0 ? (
                  <GlobalUtilityStyle>
                    <PaginationStyle>
                      <div className="ant-pagination-custom-style table-responsive">
                        <Table
                          columns={organizerTicketColumns}
                          dataSource={ticketDataSource}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                              `${range[0]}-${range[1]} of ${total} tickets`,
                          }}
                          locale={{
                            emptyText: 'No tickets found for this event'
                          }}
                        />
                      </div>
                    </PaginationStyle>
                  </GlobalUtilityStyle>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <UilTicket className="w-16 h-16 text-gray-300 dark:text-white30 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-500 dark:text-white60 mb-2">
                      No Tickets Yet
                    </h4>
                    <p className="text-gray-400 dark:text-white40 mb-4">
                      Create tickets for your event to start selling
                    </p>
                    <Link to={`/${authRole}/tickets/create?event_id=${id}`}>
                      <Button type="primary">
                        Create Your First Ticket
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              // Non-Organizer View (Attendee View)
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-dark dark:text-white87 mb-2">
                    Available Tickets ({ticketDataSource.length})
                  </h3>
                  <p className="text-gray-500 dark:text-white60">
                    Choose your preferred ticket type and book your spot for the event
                  </p>
                </div>

                {ticketDataSource.length > 0 ? (
                  <GlobalUtilityStyle>
                    <PaginationStyle>
                      <div className="ant-pagination-custom-style table-responsive">
                        <Table
                          columns={nonOrganizerTicketColumns}
                          dataSource={ticketDataSource}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                              `${range[0]}-${range[1]} of ${total} ticket types`,
                          }}
                          locale={{
                            emptyText: 'No tickets available for this event'
                          }}
                        />
                      </div>
                    </PaginationStyle>
                  </GlobalUtilityStyle>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <UilTicket className="w-16 h-16 text-gray-300 dark:text-white30 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-500 dark:text-white60 mb-2">
                      No Tickets Available
                    </h4>
                    <p className="text-gray-400 dark:text-white40 mb-4">
                      Tickets are not yet available for this event. Please check back later.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabPane>

          {/* Rest of the tabs remain the same */}
          <TabPane tab="Event Details" key="details">
            <Descriptions
              column={1}
              bordered
              className="bg-white dark:bg-white10 rounded-lg"
            >
              <Descriptions.Item label="Event Title">
                {event.title}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {event.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Slug">
                {event.slug}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date & Time">
                {formatDateTime(event.start_date, event.start_time)}
              </Descriptions.Item>
              <Descriptions.Item label="End Date & Time">
                {event.end_date ? formatDateTime(event.end_date, event.end_time) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {event.duration || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {event.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {event.city || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {event.state || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {event.country || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Event Type">
                {event.event_type || 'General'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {event.event_category || 'Uncategorized'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(event.status)}>
                  {getStatusText(event.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Featured">
                {event.is_featured ? 'Yes' : 'No'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Organizer Details" key="organizer">
            <Card>
              <div className="flex items-start gap-4 mb-6">
                {event.event_company_logo && (
                  <img
                    src={event.event_company_logo}
                    alt="Organizer Logo"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="text-lg font-semibold text-dark dark:text-white87">
                    {event.organizer}
                  </h4>
                  <p className="text-gray-500 dark:text-white60">
                    {event.organizer_type} Organizer
                  </p>
                </div>
              </div>

              <Row gutter={[16, 16]}>
                {event.email && (
                  <Col xs={24} sm={12}>
                    <div className="flex items-center gap-3">
                      <UilEnvelope className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-white60">Email</div>
                        <a
                          href={`mailto:${event.email}`}
                          className="text-primary hover:underline"
                        >
                          {event.email}
                        </a>
                      </div>
                    </div>
                  </Col>
                )}

                {event.phone_number && (
                  <Col xs={24} sm={12}>
                    <div className="flex items-center gap-3">
                      <UilPhone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-white60">Phone</div>
                        <a
                          href={`tel:${event.phone_number}`}
                          className="text-primary hover:underline"
                        >
                          {event.phone_number}
                        </a>
                      </div>
                    </div>
                  </Col>
                )}

                {event.website && (
                  <Col xs={24} sm={12}>
                    <div className="flex items-center gap-3">
                      <UilGlobe className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-white60">Website</div>
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {event.website}
                        </a>
                      </div>
                    </div>
                  </Col>
                )}

                {event.facebook_page && (
                  <Col xs={24} sm={12}>
                    <div className="flex items-center gap-3">
                      <UilFacebook className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-white60">Facebook</div>
                        <a
                          href={event.facebook_page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Facebook Page
                        </a>
                      </div>
                    </div>
                  </Col>
                )}

                {event.x_page && (
                  <Col xs={24} sm={12}>
                    <div className="flex items-center gap-3">
                      <UilTwitter className="w-5 h-5 text-black" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-white60">Twitter/X</div>
                        <a
                          href={event.x_page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Twitter Profile
                        </a>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>

              {event.organizer_company_detail && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-medium mb-2">Company Details</h5>
                  <p className="text-gray-600 dark:text-white60">
                    {event.organizer_company_detail}
                  </p>
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default EventDetailsPage;