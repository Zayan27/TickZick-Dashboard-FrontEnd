import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Spin, Modal, Tag, Descriptions, message, Select, Input, Button as AntButton, Space, Image, Card, Statistic } from 'antd';
import { Link, useLocation, useSearchParams  } from 'react-router-dom';
import { UilSearch, UilEye, UilFileDownload, UilEdit, UilTrash, UilCalendarAlt, UilUser, UilTicket, UilDollarSign, UilReceipt, UilCheckCircle, UilTimesCircle, UilClock } from '@iconscout/react-unicons';
import { GlobalUtilityStyle, PaginationStyle } from '../../container/styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";
import moment from 'moment';

const { Option } = Select;

function RefundsTicket() {
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParams = searchParams.get('status');

    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [adminNote, setAdminNote] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const location = useLocation();

    const user = getItem("auth_user");
    const   authRole = getItem("auth_role");

    const loadData = async () => {
        setLoading(true);
        try {
            // For organizer, we might need to get their events first, then bookings
            let endpoint = statusParams ? 
                `/${authRole}/bookings?status=${statusParams}` : 
                `/${authRole}/bookings`;

            // If user is organizer, you might want to use a different endpoint
            // Adjust based on your API structure
            const res = await DataService.get("/admin/refund-requests");

            const refunds = res.data.refund_requests || [];
            setBookings(refunds);
            setFiltered(refunds);
            console.log("filtered data", filtered)
            if (res.data.status) {
                const bookingsData = res.data.bookings || res.data.data || [];
                setBookings(Array.isArray(bookingsData) ? bookingsData : []);
                setFiltered(Array.isArray(bookingsData) ? bookingsData : []);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            message.error('Failed to load bookings');
        }
        setLoading(false);
    };

    useEffect(() => {
        debugger;
        loadData();
    }, [authRole, location]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;

        try {
            await DataService.delete(`/${authRole}/bookings/${id}`);
            message.success('Booking deleted successfully');
            loadData();
        } catch (error) {
            console.error("Delete error:", error);
            message.error(error?.response?.data?.message || 'Failed to delete booking');
        }
    };

    const onHandleSearch = (e) => {
        const search = e.target.value.toLowerCase();

        const result = bookings.filter(booking => {
            const bookingId = booking.booking_id || '';
            const customerName = `${booking.customer?.name}`.toLowerCase();
            const email = booking.email || '';
            const eventTitle = booking.event_title || '';
            const ticketTitle = booking.ticket_title || '';
            const status = booking.paymentStatus || '';

            return bookingId.toLowerCase().includes(search) ||
                customerName.includes(search) ||
                email.toLowerCase().includes(search) ||
                eventTitle.toLowerCase().includes(search) ||
                ticketTitle.toLowerCase().includes(search) ||
                status.toLowerCase().includes(search);
        });

        setFiltered(result);
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedBooking) return;

        setStatusLoading(true);
        try {
            const payload = {
                paymentStatus: newStatus
            };

            const response = await DataService.put(`/${authRole}/bookings/${selectedBooking.id}/update-status`, payload);

            if (response.status === 200) {
                message.success('Booking status updated successfully');

                // Update local state
                const updatedBookings = bookings.map(booking =>
                    booking.id === selectedBooking.id
                        ? { ...booking, paymentStatus: newStatus }
                        : booking
                );

                setBookings(updatedBookings);
                setFiltered(updatedBookings);

                // Update selected booking in modal
                setSelectedBooking(prev => ({ ...prev, paymentStatus: newStatus }));

                // Reload data to ensure consistency
                loadData();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            message.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'paid':
            case 'success':
                return 'success';
            case 'pending':
            case 'processing':
                return 'processing';
            case 'failed':
            case 'cancelled':
            case 'refunded':
                return 'error';
            case 'onhold':
            case 'waiting':
                return 'warning';
            default:
                return 'default';
        }
    };

    const handleRefundAction = async (action) => {
        if (!selectedBooking) return;

        setActionLoading(true);

        try {
            const { data } = await DataService.post(
                `/admin/refund-requests/${selectedBooking.id}/${action}`,
                {
                    admin_note: adminNote,
                }
            );

            message.success(data.message);

            setModalVisible(false);
            setAdminNote("");

            loadData();
        } catch (err) {
            message.error(
                err?.response?.data?.message ||
                `Failed to ${action} refund request`
            );
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'paid':
            case 'success':
                return <UilCheckCircle className="w-4 h-4" />;
            case 'pending':
            case 'processing':
                return <UilClock className="w-4 h-4" />;
            case 'failed':
            case 'cancelled':
            case 'refunded':
                return <UilTimesCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatPrice = (booking) => {
        if (booking.formatted_price) {
            return booking.formatted_price;
        }

        if (booking.currencySymbol && booking.price) {
            return booking.currencySymbolPosition === 'left'
                ? `${booking.currencySymbol}${booking.price}`
                : `${booking.price}${booking.currencySymbol}`;
        }

        return booking.price ? `$${booking.price}` : 'N/A';
    };

    const [state, setState] = useState({
        selectedRowKeys: [],
    });
    const { selectedRowKeys } = state;

    const dataSource = [];

    if (filtered.length) {
        filtered.forEach((booking, index) => {
            dataSource.push({
                key: index + 1,
                bookingId: (
                    <span className="font-mono text-body dark:text-white60 text-[15px] font-medium">
                        #{booking.booking?.booking_id}
                    </span>
                ),
                customer: (
                    <div>
                        <div className="font-medium text-dark dark:text-white87">
                            {booking.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-white60">
                            {booking.customer?.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-white40">
                            {booking.customer?.phone}
                        </div>
                    </div>
                ),
                event: (
                    <div>
                        <div className="font-medium text-dark dark:text-white87">
                            {booking.event?.title || 'Event'}
                        </div>
                        {/* <div className="text-sm text-gray-500 dark:text-white60">
                            {booking.ticket_title || 'Ticket'}
                        </div> */}
                    </div>
                ),
                amount: (
                    <div className="font-mono">
                        <div className="font-semibold text-dark dark:text-white87">
                            {booking.booking?.price}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-white60">
                            Qty: {booking.booking?.quantity || 1}
                        </div>
                    </div>
                ),
                date: (
                    <div>
                        <div className="text-body dark:text-white60 text-[15px]">
                            {moment(booking.created_at).format('DD MMM YYYY')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-white60">
                            {moment(booking.created_at).format('hh:mm A')}
                        </div>
                    </div>
                ),
                status: (
                    <Tag
                        color={getStatusColor(booking.status)}
                        icon={getStatusIcon(booking.status)}
                        className="inline-flex items-center gap-1"
                    >
                        {booking.status_label}
                    </Tag>
                ),
                action: (
                    <div className="flex items-center gap-3 justify-start">
                        <button
                            className="text-primary hover:text-primary-dark"
                            onClick={() => handleViewDetails(booking)}
                            title="View Details"
                        >
                            <UilEye className="w-4 h-4" />
                        </button>

                        {authRole === 'admin' && (
                            <button
                                className="text-danger hover:text-danger-dark"
                                onClick={() => handleDelete(booking.id)}
                                title="Delete Booking"
                            >
                                <UilTrash className="w-4 h-4" />
                            </button>
                        )}

                        {booking.invoice && (
                            <a
                                href={booking.invoice}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-info hover:text-info-dark"
                                title="Download Invoice"
                            >
                                <UilFileDownload className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ),
            });
        });
    }
    
    const columns = [
        { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        { title: 'Event', dataIndex: 'event', key: 'event' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Action', dataIndex: 'action', key: 'action' },
    ];

    // const columns = [
    //     { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
    //     { title: 'Email', dataIndex: ['customer', 'email'], key: 'email' },
    //     { title: 'Phone', dataIndex: ['customer', 'phone'], key: 'phone' },
    //     { title: 'Event', dataIndex: ['event', 'title'], key: 'event' },
    //     { title: 'Event Date', dataIndex: ['event', 'start_date'], key: 'eventDate', width: '150px' },
    //     { title: 'Amount', dataIndex: ['booking', 'price'], key: 'amount', width: '120px' },
    //     { title: 'Qty', dataIndex: ['booking', 'quantity'], key: 'quantity', width: '80px' },
    //     { title: 'Reason', dataIndex: 'reason_label', key: 'reason' },
    //     { title: 'Status', dataIndex: 'status_label', key: 'status', width: '140px' },
    //     { title: 'Submitted', dataIndex: 'created_at', key: 'submitted', width: '160px' },
    //     { title: 'Action', dataIndex: 'action', key: 'action', width: '100px' },
    // ];


    const onSelectChange = (selectedRowKey) => {
        setState({ ...state, selectedRowKeys: selectedRowKey });
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Status options for dropdown
    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'processing' },
        { value: 'processing', label: 'Processing', color: 'processing' },
        { value: 'completed', label: 'Completed', color: 'success' },
        { value: 'paid', label: 'Paid', color: 'success' },
        { value: 'failed', label: 'Failed', color: 'error' },
        { value: 'cancelled', label: 'Cancelled', color: 'error' },
        { value: 'refunded', label: 'Refunded', color: 'default' },
        { value: 'onhold', label: 'On Hold', color: 'warning' },
    ];

    return (
        <div>
            {/* Booking Details Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <UilEye className="w-5 h-5 text-primary" />
                        <span>Refund Request - #{selectedBooking?.booking?.booking_id}</span>
                    </div>
                }
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={800}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setModalVisible(false)}
                    >
                        Close
                    </Button>,
                ]}
            >
                {selectedBooking && (
                    <div className="p-4">
                        {/* Booking Status Update Section */}
                        <Card className="mb-6">
                            <div className="flex flex-col gap-4">

                                <div className="flex items-center justify-between">
                                    <Tag
                                        color={getStatusColor(selectedBooking.status)}
                                        className="text-base px-4 py-1"
                                    >
                                        {selectedBooking.status_label}
                                    </Tag>

                                    {selectedBooking.status === "pending" && (
                                        <div className="flex gap-2">
                                            <Button
                                                danger
                                                loading={actionLoading}
                                                onClick={() => handleRefundAction("reject")}
                                            >
                                                Reject
                                            </Button>

                                            <Button
                                                type="primary"
                                                loading={actionLoading}
                                                onClick={() => handleRefundAction("approve")}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Input.TextArea
                                    rows={4}
                                    placeholder="Admin note (optional)"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    maxLength={2000}
                                />
                            </div>
                        </Card>
                        {/* Booking Information */}
                        <Descriptions
                            title={
                                <div className="flex items-center gap-2">
                                    <UilReceipt className="w-4 h-4" />
                                    <span>Booking Information</span>
                                </div>
                            }
                            bordered
                            column={2}
                            className="mb-6"
                        >
                            <Descriptions.Item label="Booking ID">
                                <span className="font-mono">#{selectedBooking.booking?.booking_id}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Booking Date">
                                {moment(selectedBooking.event?.start_date).format('DD MMM YYYY hh:mm A')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Event">
                                {selectedBooking.event?.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                {`Rs ${selectedBooking.booking?.price}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Quantity">
                                {selectedBooking.booking?.quantity}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Event Date">
                                {selectedBooking.event_date
                                    ? moment(selectedBooking.event_date).format('DD MMM YYYY')
                                    : 'N/A'}
                            </Descriptions.Item> */}
                        </Descriptions>

                        {/* Customer Information */}
                        <Descriptions
                            title={
                                <div className="flex items-center gap-2">
                                    <UilUser className="w-4 h-4" />
                                    <span>Customer Information</span>
                                </div>
                            }
                            bordered
                            column={2}
                            className="mb-6"
                        >
                            <Descriptions.Item label="Name">
                                {selectedBooking.customer?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedBooking.customer?.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                {selectedBooking.customer?.phone || "N/A"}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Address">
                                {selectedBooking.address || 'N/A'}
                                {selectedBooking.city && `, ${selectedBooking.city}`}
                                {selectedBooking.state && `, ${selectedBooking.state}`}
                                {selectedBooking.country && `, ${selectedBooking.country}`}
                                {selectedBooking.zip_code && ` - ${selectedBooking.zip_code}`}
                            </Descriptions.Item> */}
                        </Descriptions>

                        <Descriptions title="Refund Information" bordered column={2}>
                            <Descriptions.Item label="Reason">
                                {selectedBooking.reason_label}
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(selectedBooking.status)}>
                                    {selectedBooking.status_label}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Comments" span={2}>
                                {selectedBooking.additional_comments || "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Admin Note" span={2}>
                                {selectedBooking.admin_note || "N/A"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Submitted">
                                {moment(selectedBooking.created_at).format("DD MMM YYYY hh:mm A")}
                            </Descriptions.Item>

                            <Descriptions.Item label="Reviewed">
                                {selectedBooking.reviewed_at
                                    ? moment(selectedBooking.reviewed_at).format("DD MMM YYYY hh:mm A")
                                    : "Not Reviewed"}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Payment Information */}
                        {/* <Descriptions
                            title={
                                <div className="flex items-center gap-2">
                                    <UilDollarSign className="w-4 h-4" />
                                    <span>Payment Information</span>
                                </div>
                            }
                            bordered
                            column={2}
                            className="mb-6"
                        >
                            <Descriptions.Item label="Amount">
                                <span className="font-mono text-lg font-bold">
                                    {formatPrice(selectedBooking)}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tax">
                                {selectedBooking.tax ? `${selectedBooking.tax} (${selectedBooking.tax_percentage || 0}%)` : 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Commission">
                                {selectedBooking.commission ? `${selectedBooking.commission} (${selectedBooking.commission_percentage || 0}%)` : 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Discount">
                                {selectedBooking.discount || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Early Bird Discount">
                                {selectedBooking.early_bird_discount || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                {selectedBooking.paymentMethod || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gateway Type">
                                {selectedBooking.gatewayType || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Status" span={2}>
                                <Tag
                                    color={getStatusColor(selectedBooking.paymentStatus)}
                                    className="text-base px-3 py-1"
                                >
                                    {selectedBooking.status_label || selectedBooking.paymentStatus}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions> */}

                        {/* Invoice Section */}
                        {selectedBooking.invoice && (
                            <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-white10">
                                <h4 className="text-lg font-semibold mb-3">Invoice</h4>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={selectedBooking.invoice}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
                                    >
                                        <UilFileDownload className="w-5 h-5" />
                                        <span>Download Invoice</span>
                                    </a>
                                    {selectedBooking.attachmentFile && (
                                        <a
                                            href={selectedBooking.attachmentFile}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-info hover:text-info-dark"
                                        >
                                            <UilFileDownload className="w-5 h-5" />
                                            <span>View Attachment</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <PageHeader
                className="flex items-center justify-between px-[30px] py-[25px] bg-transparent [&>div>div>.ant-page-header-heading-title]:text-[22px] [&>div>div>.ant-page-header-heading-title]:font-semibold [&>div>div>.ant-page-header-heading-title]:text-dark dark:[&>div>div>.ant-page-header-heading-title]:text-white leading-[32px] [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px]"
                buttons={[
                    <div key={1} className="relative">
                        <span className="absolute left-[18px] top-[50%] translate-y-[-50%]">
                            <UilSearch className="w-[16px] h-[16px] text-light dark:text-white60" />
                        </span>
                        <input
                            className="border-none h-[40px] min-w-[280px] ltr:pl-[45px] ltr:pr-[20px] rtl:pr-[45px] rtl:pl-[20px] rounded-6 bg-white dark:bg-white10 focus-none outline-none"
                            onChange={onHandleSearch}
                            type="text"
                            placeholder="Search by Booking ID, Name, Email, Event..."
                        />
                    </div>,
                ]}
                ghost
                title='Refund Tickets'
            />

            <div className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={15}>
                    <Col className="w-100" md={24}>
                        <div className="bg-white dark:bg-white10 p-[25px] rounded-[10px]">
                            {loading ? (
                                <div className="flex items-center justify-center [&>div]:flex [&>div]:items-center h-64">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <GlobalUtilityStyle>
                                    <PaginationStyle>
                                        <div className="ant-pagination-custom-style table-responsive hover-tr-none table-th-shape-none table-last-th-text-right table-th-border-none table-head-rounded table-selection-col-pl-25 table-tr-selected-background-transparent table-td-border-none bg-white dark:bg-white10 min-sm:p-[25px] rounded-[10px] ltr:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:first-child]:rounded-l-10 rtl:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:first-child]:rounded-r-10 rtl:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:first-child]:rounded-none ltr:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:last-child]:rounded-r-10 rtl:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:last-child]:rounded-l-10 rtl:[&>div>div>div>div>div>.ant-table-content>table>thead>tr>th:last-child]:rounded-none">
                                            <Table
                                                className="[&>div>div>.ant-table]:mb-7 [&>div>div>.ant-table]:pb-5 [&>div>div>.ant-table]:border-b [&>div>div>.ant-table]:border-regular dark:[&>div>div>.ant-table]:border-white10 ltr:[&>div>div>div>div>div>table>thead>tr>th:first-child]:pl-[20px] ltr:[&>div>div>div>div>div>table>tbody>tr>td:first-child]:pl-[20px] rtl:[&>div>div>div>div>div>table>thead>tr>th:first-child]:pr-[20px] rtl:[&>div>div>div>div>div>table>tbody>tr>td:first-child]:pr-[20px]"
                                                rowSelection={rowSelection}
                                                pagination={{
                                                    pageSize: 10,
                                                    showSizeChanger: true,
                                                    showTotal: (total, range) =>
                                                        `${range[0]}-${range[1]} of ${total} bookings`,
                                                    itemRender: (page, type, element) => {
                                                        if (type === "page") {
                                                            return (
                                                                <button className="ant-pagination-item-link ">
                                                                    {page}
                                                                </button>
                                                            );
                                                        }
                                                        return element;
                                                    },
                                                }}
                                                dataSource={dataSource}
                                                columns={columns}
                                                locale={{
                                                    emptyText: (
                                                        <div className="text-center py-8">
                                                            <UilTicket className="w-16 h-16 text-gray-300 dark:text-white30 mx-auto mb-4" />
                                                            <h4 className="text-lg font-semibold text-gray-500 dark:text-white60 mb-2">
                                                                No Bookings Found
                                                            </h4>
                                                            <p className="text-gray-400 dark:text-white40">
                                                                No booking records available yet.
                                                            </p>
                                                        </div>
                                                    )
                                                }}
                                            />
                                        </div>
                                    </PaginationStyle>
                                </GlobalUtilityStyle>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default RefundsTicket;