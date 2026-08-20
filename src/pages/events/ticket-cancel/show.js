import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Spin, message, Tag, Button as AntButton, Divider, Statistic, Descriptions, Space, Tabs, Image, Badge } from 'antd';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Button } from '../../../components/buttons/buttons';
import { DataService } from '../../../config/dataService/dataService';
import { getItem } from '../../../utility/localStorageControl';
import {
  UilCalendarAlt,
  UilUsersAlt,
  UilEnvelope,
  UilClock,
  UilCheckCircle,
} from '@iconscout/react-unicons';

function EventCancellationRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cancellationRequest, setCancellationRequest] = useState(null);
  const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
  const authRole = getItem('auth_role');

  // Load cancellation request details
  const loadCancellationRequest = async () => {
    setLoading(true);

    try {
      const res = await DataService.get(
        `/${authRole}/event-cancellation-requests/${id}/show`
      );

      if (res.data.success) {
        setCancellationRequest(res.data.cancellation_request);
      } else {
        throw new Error('Cancellation request not found');
      }
    } catch (error) {
      console.error('Cancellation request fetch error:', error);

      message.error(
        error?.response?.data?.message ||
          'Failed to load cancellation request details'
      );

      navigate(`/${authRole}/event-cancellation-requests`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCancellationRequest();
    }
  }, [id, authRole]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Cancellation request status color
  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';

      case 'approved':
        return 'green';

      case 'rejected':
        return 'red';

      default:
        return 'blue';
    }
  };

    const handleApprove = async () => {
        if (!id) {
            message.error('Unable to approve event');
            return;
        }

        try {
            setActionLoading('approve');

            const res = await DataService.post(
                `/${authRole}/event-cancellation-requests/${id}/approve`
            );

            if (res?.data?.success) {
                message.success(
                    res.data.message || 'Event cancellation request approved successfully'
                );

                // Refresh the request details so status becomes Approved
                await loadCancellationRequest();
            } else {
                message.error(
                    res?.data?.message || 'Unable to approve event'
                );
            }
        } catch (error) {
            console.error('Approve cancellation request error:', error);

            message.error(
                error?.response?.data?.message ||
                'Unable to approve event'
            );
        } finally {
            setActionLoading(null);
        }
    };
    const handleReject = async () => {
        if (!id) {
            message.error('Unable to reject event');
            return;
        }

        try {
            setActionLoading('reject');

            const res = await DataService.post(
                `/${authRole}/event-cancellation-requests/${id}/reject`
            );

            if (res?.data?.success) {
                message.success(
                    res.data.message || 'Event cancellation request rejected successfully'
                );

                // Refresh the request details so status becomes Rejected
                await loadCancellationRequest();
            } else {
                message.error(
                    res?.data?.message || 'Unable to reject event'
                );
            }
        } catch (error) {
            console.error('Reject cancellation request error:', error);

            message.error(
                error?.response?.data?.message ||
                'Unable to reject event'
            );
        } finally {
            setActionLoading(null);
        }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!cancellationRequest) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-dark dark:text-white87 mb-4">
          Cancellation Request Not Found
        </h2>

        <Button
          type="primary"
          onClick={() =>
            navigate(`/${authRole}/cancel-requests`)
          }
        >
          Back to Cancellation Requests
        </Button>
      </div>
    );
  }

  const event = cancellationRequest.event;
  const organizer = cancellationRequest.organizer;
  const admin = cancellationRequest.admin;

  return (
    <div>
      
        
      <div className='flex justify-between px-[30px] py-[25px]'>
        {/* Page Header */}
      <PageHeader
        className="flex items-center justify-between  bg-transparent w-full"
        ghost
        title={
            <div>
            <h1 className="text-[22px] font-semibold text-dark dark:text-white87 mb-1">
                Cancellation Request
            </h1>

            <p className="text-gray-500 dark:text-white60 text-sm">
                Review event cancellation request details
            </p>
            </div>
        }
            
        />
        <div key="actions" className="flex items-center gap-3">
            <AntButton
                type="primary"
                loading={actionLoading === 'approve'}
                disabled={actionLoading !== null}
                onClick={handleApprove}
            >
                Approve
            </AntButton>

            <AntButton
                danger
                loading={actionLoading === 'reject'}
                disabled={actionLoading !== null}
                onClick={handleReject}
            >
                Reject
            </AntButton>
        </div>
      </div>
      

      <div className="min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">

        {/* Request Overview */}
        <Row gutter={[20, 20]} className="mb-6">

          {/* Cancellation Request */}
          <Col xs={24} lg={16}>
            <Card className="rounded-[10px]">

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-dark dark:text-white87">
                    {event?.title || 'N/A'}
                  </h2>

                  <p className="text-gray-500 dark:text-white60 mt-1">
                    Cancellation Request
                  </p>
                </div>

                <Tag
                  color={getRequestStatusColor(
                    cancellationRequest.status
                  )}
                  className="text-sm font-medium px-3 py-1"
                >
                  {cancellationRequest.status_label ||
                    cancellationRequest.status}
                </Tag>
              </div>

              <Divider />

              {/* Reason */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <UilUsersAlt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-white60">
                      Cancellation Reason
                    </div>

                    <div className="font-medium text-dark dark:text-white87 mt-1">
                      {cancellationRequest.reason || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Dates */}
              <Row gutter={[20, 20]}>

                <Col xs={24} sm={12}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <UilCalendarAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-white60">
                        Event Start Date
                      </div>

                      <div className="font-medium text-dark dark:text-white87 mt-1">
                        {formatDate(event?.start_date)}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <UilCalendarAlt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-white60">
                        Event End Date
                      </div>

                      <div className="font-medium text-dark dark:text-white87 mt-1">
                        {formatDate(event?.end_date)}
                      </div>
                    </div>
                  </div>
                </Col>

              </Row>

              <Divider />

              {/* Request Dates */}
              <Row gutter={[20, 20]}>

                <Col xs={24} sm={12}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white10 flex items-center justify-center">
                      <UilClock className="w-5 h-5 text-gray-600 dark:text-white60" />
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-white60">
                        Requested At
                      </div>

                      <div className="font-medium text-dark dark:text-white87 mt-1">
                        {formatDateTime(
                          cancellationRequest.created_at
                        )}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <UilCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-white60">
                        Reviewed At
                      </div>

                      <div className="font-medium text-dark dark:text-white87 mt-1">
                        {cancellationRequest.reviewed_at
                          ? formatDateTime(
                              cancellationRequest.reviewed_at
                            )
                          : 'Not reviewed yet'}
                      </div>
                    </div>
                  </div>
                </Col>

              </Row>
            </Card>
          </Col>

          {/* Organizer */}
          <Col xs={24} lg={8}>
            <Card className="rounded-[10px] h-full">

              <h3 className="text-lg font-semibold text-dark dark:text-white87 mb-6">
                Organizer Details
              </h3>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UilUsersAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <h4 className="font-semibold text-dark dark:text-white87">
                    {organizer?.name || 'N/A'}
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-white60 mt-1">
                    Event Organizer
                  </p>
                </div>
              </div>

              <Divider />

              <div className="flex items-start gap-3">
                <UilEnvelope className="w-5 h-5 text-gray-500 mt-1" />

                <div>
                  <div className="text-sm text-gray-500 dark:text-white60">
                    Email
                  </div>

                  {organizer?.email ? (
                    <a
                      href={`mailto:${organizer.email}`}
                      className="text-primary hover:underline"
                    >
                      {organizer.email}
                    </a>
                  ) : (
                    <div className="font-medium">
                      N/A
                    </div>
                  )}
                </div>
              </div>

            </Card>
          </Col>
        </Row>

        {/* Request Details */}
        <Card className="rounded-[10px] mb-6">

          <h3 className="text-lg font-semibold text-dark dark:text-white87 mb-6">
            Request Details
          </h3>

          <Descriptions
            column={{
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
            }}
            bordered
          >
            <Descriptions.Item label="Request ID">
              {cancellationRequest.id}
            </Descriptions.Item>

            <Descriptions.Item label="Event ID">
              {cancellationRequest.event_id}
            </Descriptions.Item>

            <Descriptions.Item label="Organizer ID">
              {cancellationRequest.organizer_id}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag
                color={getRequestStatusColor(
                  cancellationRequest.status
                )}
              >
                {cancellationRequest.status_label ||
                  cancellationRequest.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Cancellation Reason">
              {cancellationRequest.reason || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item label="Request Created">
              {formatDateTime(cancellationRequest.created_at)}
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              {formatDateTime(cancellationRequest.updated_at)}
            </Descriptions.Item>

            <Descriptions.Item label="Reviewed At">
              {cancellationRequest.reviewed_at
                ? formatDateTime(cancellationRequest.reviewed_at)
                : 'Not reviewed yet'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Admin Review */}
        <Card className="rounded-[10px]">

          <h3 className="text-lg font-semibold text-dark dark:text-white87 mb-6">
            Admin Review
          </h3>

          <Descriptions column={1} bordered>

            <Descriptions.Item label="Admin">
              {admin?.name || 'Not reviewed yet'}
            </Descriptions.Item>

            <Descriptions.Item label="Admin Note">
              {cancellationRequest.admin_note || 'No admin note provided'}
            </Descriptions.Item>

            <Descriptions.Item label="Review Status">
              <Tag
                color={getRequestStatusColor(
                  cancellationRequest.status
                )}
              >
                {cancellationRequest.status_label ||
                  cancellationRequest.status}
              </Tag>
            </Descriptions.Item>

          </Descriptions>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            type="default"
            onClick={() =>
              navigate(`/${authRole}/cancel-requests`)
            }
          >
            Back to Cancellation Requests
          </Button>
        </div>

      </div>
    </div>
  );
}

export default EventCancellationRequestDetails;