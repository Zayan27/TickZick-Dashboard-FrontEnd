import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Avatar, Tag, Input, Button, Upload, message, Spin, Modal } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";
import { UilPaperclip, UilCheckCircle, UilClock, UilTimesCircle, UilSync } from '@iconscout/react-unicons';
import { Link, useParams } from 'react-router-dom';

const { TextArea } = Input;

function SupportTicketDetails() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replying, setReplying] = useState(false);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [fileList, setFileList] = useState([]);
    const authRole = getItem("auth_role");
    const user = getItem("auth_user");
    const isAdmin = authRole === 'admin';

    const loadTicketDetails = async () => {
        setLoading(true);
        try {
            const res = await DataService.get(`/${authRole}/support-tickets/${id}/message`);
            if (res.data.status) {
                setTicket(res.data.supprt_ticket);
                setReplies(res.data.supprt_ticket.messages || []);
            }
        } catch (error) {
            console.error("Fetch ticket error:", error);
            message.error('Failed to load ticket details');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            loadTicketDetails();
        }
    }, [id]);

    const getStatusTag = (statusCode) => {
        // Convert status to number for comparison
        const status = parseInt(statusCode);

        switch (status) {
            case 2:
                return <Tag color="#52c41a" className="px-3 py-1 rounded-full text-xs font-semibold">Open</Tag>;
            case 3:
                return <Tag color="#f5222d" className="px-3 py-1 rounded-full text-xs font-semibold">Closed</Tag>;
            case 1:
                return <Tag color="#fa8c16" className="px-3 py-1 rounded-full text-xs font-semibold">Pending</Tag>;
            default:
                return <Tag className="px-3 py-1 rounded-full text-xs font-semibold">Unknown</Tag>;
        }
    };

    // Helper function to check if ticket is closed
    const isTicketClosed = () => {
        if (!ticket) return false;
        return parseInt(ticket.status) === 3;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleReplySubmit = async () => {
        if (!messageContent.trim()) {
            message.warning('Please enter a message');
            return;
        }

        setReplying(true);
        try {
            const formData = new FormData();
            formData.append('reply', messageContent);
            if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            }

            const res = await DataService.post(`/${authRole}/support-tickets/${id}/reply`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.status) {
                message.success('Reply sent successfully');
                setMessageContent('');
                setFileList([]);
                loadTicketDetails();
            } else {
                throw new Error(res.data.message);
            }
        } catch (error) {
            console.error("Reply error:", error);
            message.error(error.response?.data?.message || 'Failed to send reply');
        }
        setReplying(false);
    };

    // Admin-only function to close ticket
    const handleCloseTicket = async () => {
        Modal.confirm({
            title: 'Close Ticket',
            content: 'Are you sure you want to close this ticket? Users will not be able to reply to closed tickets.',
            okText: 'Yes, Close Ticket',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setClosing(true);
                const payload = {
                    status: 3,
                };
                try {
                    const res = await DataService.post(`/${authRole}/support-tickets/${id}/status`, payload);
                    if (res.data.status) {
                        message.success('Ticket closed successfully');
                        loadTicketDetails();
                    } else {
                        throw new Error(res.data.message);
                    }
                } catch (error) {
                    console.error("Close ticket error:", error);
                    message.error(error.response?.data?.message || 'Failed to close ticket');
                }
                setClosing(false);
            }
        });
    };

    // Admin-only function to open/reopen ticket
    const handleOpenTicket = async () => {
        setOpening(true);
        try {
            const payload = {
                status: 2,
            };
            const res = await DataService.post(`/${authRole}/support-tickets/${id}/status`, payload);
            if (res.data.status) {
                message.success('Ticket opened successfully');
                loadTicketDetails();
            } else {
                throw new Error(res.data.message);
            }
        } catch (error) {
            console.error("Open ticket error:", error);
            message.error(error.response?.data?.message || 'Failed to open ticket');
        }
        setOpening(false);
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // Check file size (5MB)
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            return false;
        },
        fileList,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="text-center">
                    <h3 className="text-lg font-semibold text-dark dark:text-white">Ticket not found</h3>
                    <Link to={`/${authRole}/support-tickets`} className="text-primary hover:underline">
                        Back to Tickets
                    </Link>
                </Card>
            </div>
        );
    }

    const ticketClosed = isTicketClosed();

    return (
        <>
            <PageHeader
                className="flex items-center justify-between px-8 py-[25px] bg-transparent [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-between [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px] ant-page-header-ghost"
                ghost
                title="Support Ticket Details"
                subTitle={
                    <div className="flex items-center gap-3">
                        {/* Admin-only close/open buttons */}
                        {isAdmin && (
                            <>
                                {ticketClosed ? (
                                    <Button
                                        type="primary"
                                        onClick={handleOpenTicket}
                                        loading={opening}
                                        className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
                                    >
                                        Reopen Ticket
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        danger
                                        onClick={handleCloseTicket}
                                        loading={closing}
                                    >
                                        Close Ticket
                                    </Button>
                                )}
                            </>
                        )}

                        <Link
                            to={`/${authRole}/support-tickets`}
                            className="bg-white dark:bg-white10 border border-gray-300 dark:border-white10 text-dark dark:text-white87 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white20 transition-colors"
                        >
                            Back to Tickets
                        </Link>
                    </div>
                }
            />

            <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={20}>
                    <Col xs={24}>
                        {/* Ticket Header */}
                        <Card className="mb-6 border-0 shadow-sm dark:bg-white10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl text-dark dark:text-white pb-4 mb-4 border-b">
                                        Ticket Details: #{ticket.ticket_number}
                                    </h1>
                                    <div className="flex flex-col items-center gap-1 justify-center">
                                        <div className="text-center font-medium text-xl mb-4">
                                            {ticket.subject}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusTag(ticket.status)}
                                            </div>
                                            <Tag color="#1572E8" className="px-3 py-1 rounded-full text-xs font-semibold">{formatDate(ticket.updated_at)}</Tag>
                                        </div>
                                        <div className="text-dark dark:text-white text-center font-medium">
                                            {ticket.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Row gutter={20}>
                            {/* Main Content - Ticket and Replies */}
                            <Col xs={24} lg={12}>
                                {/* Replies Section */}
                                {replies.length > 0 && (
                                    <Card
                                        className="mb-6 border-0 shadow-sm dark:bg-white10"
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-semibold text-dark dark:text-white">
                                                    Replies ({replies.length})
                                                </span>
                                            </div>
                                        }
                                    >
                                        <div className="space-y-6">
                                            {replies.map((reply, index) => (
                                                <div key={reply.id} className="flex gap-4">
                                                    <Avatar
                                                        size="large"
                                                        className={reply.type === 2 ? 'bg-green-500' : 'bg-primary'}
                                                    >
                                                        {reply?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-dark dark:text-white">
                                                                    {reply?.user?.name
                                                                        || `${reply?.user?.fname ?? ''} ${reply?.user?.lname ?? ''}`.trim()
                                                                        || `${reply?.user?.first_name ?? ''} ${reply?.user?.last_name ?? ''}`.trim()
                                                                        || 'Unknown User'
                                                                    }
                                                                </span>
                                                                <Tag
                                                                    color={reply.type === 2 ? 'green' : 'blue'}
                                                                    className="text-xs"
                                                                >
                                                                    {reply.type === 2 ? 'Support Team' : 'User'}
                                                                </Tag>
                                                            </div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                {formatDate(reply.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="prose dark:prose-invert max-w-none">
                                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                                {reply.reply}
                                                            </p>
                                                        </div>
                                                        {reply.file && (
                                                            <div className="mt-4">
                                                                <a
                                                                    href={reply.file}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark text-sm"
                                                                >
                                                                    <UilPaperclip className="w-3 h-3" />
                                                                    <span>Download Attachment</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </Col>

                            {/* Sidebar - Ticket Information */}
                            <Col xs={24} lg={12}>
                                {/* Reply Form - Only show if ticket is NOT closed */}
                                {!ticketClosed ? (
                                    <Card
                                        className="border-0 shadow-sm dark:bg-white10"
                                        title={
                                            <span className="text-lg font-semibold text-dark dark:text-white">
                                                Reply to Ticket
                                            </span>
                                        }
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                                                    Message *
                                                </label>
                                                <TextArea
                                                    rows={6}
                                                    value={messageContent}
                                                    onChange={(e) => setMessageContent(e.target.value)}
                                                    placeholder="Type your reply here..."
                                                    className="w-full border-gray-300 dark:border-white10 dark:bg-white20 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                                                    Attachment (Optional)
                                                </label>
                                                <Upload {...uploadProps}>
                                                    <Button
                                                        icon={<UilPaperclip className="w-4 h-4" />}
                                                        className="flex items-center gap-2"
                                                    >
                                                        Attach File (max 5MB)
                                                    </Button>
                                                </Upload>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    Supported files: documents, images, zip files
                                                </p>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button
                                                    type="primary"
                                                    onClick={handleReplySubmit}
                                                    loading={replying}
                                                    className="bg-primary hover:bg-primary-dark"
                                                >
                                                    Send Message
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className="border-0 shadow-sm dark:bg-white10 text-center">
                                        <UilCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                                            This ticket is closed
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            No further replies can be added to closed tickets.
                                        </p>
                                        {/* Admin can still reopen even if ticket is closed */}
                                        {isAdmin && (
                                            <Button
                                                type="primary"
                                                icon={<UilSync className="w-4 h-4" />}
                                                onClick={handleOpenTicket}
                                                loading={opening}
                                                className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
                                            >
                                                Reopen Ticket
                                            </Button>
                                        )}
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </main>
        </>
    );
}

export default SupportTicketDetails;