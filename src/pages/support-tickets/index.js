import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Spin, Tag, Badge, message } from 'antd';
import { Link } from 'react-router-dom';
import { UilPlus, UilSearch, UilCommentMessage, UilTrash, UilFileCheck, UilEye } from '@iconscout/react-unicons';
import { GlobalUtilityStyle, PaginationStyle } from '../../container/styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";

function SupportTicketPage() {
    const [supportTickets, setSupportTickets] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const authRole = getItem("auth_role");

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await DataService.get(`/${authRole}/support-tickets`);
            if (res.data.status) {
                const tickets = res.data.support_tickets || res.data.supprt_tickets || [];
                setSupportTickets(tickets);
                setFiltered(tickets);
            } else {
                message.error(res.data.message || 'Failed to load support tickets');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            message.error('Failed to load support tickets');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this support ticket?")) return;

        try {
            const res = await DataService.post(`/${authRole}/support-tickets/${id}/delete`);
            if (res.data.status) {
                message.success('Support ticket deleted successfully');
                loadData();
            } else {
                message.error(res.data.message || 'Failed to delete support ticket');
            }
        } catch (error) {
            console.error("Delete error:", error);
            message.error('Failed to delete support ticket');
        }
    };

    const onHandleSearch = (e) => {
        const search = e.target.value.toLowerCase();

        const result = supportTickets.filter(ticket =>
            (ticket.ticket_number || "").toLowerCase().includes(search) ||
            (ticket.email || "").toLowerCase().includes(search) ||
            (ticket.subject || "").toLowerCase().includes(search) ||
            (ticket.description || "").toLowerCase().includes(search)
        );

        setFiltered(result);
    };

    const [state, setState] = useState({
        selectedRowKeys: [],
    });
    const { selectedRowKeys } = state;

    const onSelectChange = (selectedRowKey) => {
        setState({ ...state, selectedRowKeys: selectedRowKey });
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Function to get status display
    const getStatusDisplay = (statusCode) => {
        // Convert status code to number for comparison
        const status = parseInt(statusCode);

        switch (status) {
            case 1:
                return { color: 'orange', text: 'Pending' };
            case 2:
                return { color: 'green', text: 'Open' };
            case 3:
                return { color: 'red', text: 'Closed' };
            default:
                return { color: 'default', text: `Unknown (${statusCode})` };
        }
    };

    // Prepare columns
    const columns = [
        {
            title: 'Ticket #',
            dataIndex: 'ticket_number',
            key: 'ticket_number',
            width: '120px',
            render: (text) => (
                <span className="text-body dark:text-white60 text-[15px] font-medium">
                    #{text}
                </span>
            )
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: '200px',
            render: (text) => (
                <span className="text-body dark:text-white60 text-[15px] font-medium line-clamp-1">
                    {text}
                </span>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '180px',
            render: (text) => (
                <span className="text-body dark:text-white60 text-[15px] font-medium">
                    {text}
                </span>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: '120px',
            render: (date) => (
                <span className="text-body dark:text-white60 text-[14px]">
                    {date ? new Date(date).toLocaleDateString() : '-'}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '120px',
            render: (statusCode) => {
                const statusInfo = getStatusDisplay(statusCode);
                return (
                    <Tag color={statusInfo.color} className="min-h-[24px] px-3 text-xs font-medium rounded-[15px]">
                        {statusInfo.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'action',
            align: 'center',
            width: '150px',
            render: (_, record) => {
                const status = parseInt(record.status);
                const isClosed = status === 3;

                return (
                    <div className="flex items-center gap-3 justify-center">
                        {/* Message/Details Button */}
                        {!isClosed && (
                            <Link
                                className="text-primary hover:text-primary-dark"
                                to={`/${authRole}/support-tickets/message/${record.id}`}
                                title="View Details & Messages"
                            >
                                <UilEye className="w-5 h-5" />
                            </Link>
                        )}

                        {/* Delete Button */}
                        {authRole === 'admin' && (
                            <button
                                className="text-danger hover:text-danger-dark"
                                onClick={() => handleDelete(record.id)}
                                title="Delete Ticket"
                            >
                                <UilTrash className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                );
            }
        },
    ];

    // Prepare data for table
    const tableData = filtered.map((ticket, index) => ({
        key: index,
        ...ticket
    }));

    return (
        <div>
            <PageHeader
                className="flex items-center justify-between px-[30px] py-[25px] bg-transparent [&>div>div>.ant-page-header-heading-title]:text-[22px] [&>div>div>.ant-page-header-heading-title]:font-semibold [&>div>div>.ant-page-header-heading-title]:text-dark dark:[&>div>div>.ant-page-header-heading-title]:text-white leading-[32px] [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px]"
                subTitle={
                    authRole === 'organizer' && (
                        <Link
                            className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
                            to={`/${authRole}/support-tickets/create`}
                        >
                            <UilPlus className="w-[15px] h-[15px]" /> <span>Create Ticket</span>
                        </Link>
                    )
                }
                buttons={[
                    <div key={1} className="relative">
                        <span className="absolute left-[18px] top-[50%] translate-y-[-50%]">
                            <UilSearch className="w-[16px] h-[16px] text-light dark:text-white60" />
                        </span>
                        <input
                            className="border-none h-[40px] min-w-[280px] ltr:pl-[45px] ltr:pr-[20px] rtl:pr-[45px] rtl:pl-[20px] rounded-6 bg-white dark:bg-white10 focus-none outline-none"
                            onChange={onHandleSearch}
                            type="text"
                            name="recored-search"
                            placeholder="Search by ticket #, subject, email..."
                        />
                    </div>,
                ]}
                ghost
                title="Support Tickets"
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
                                                        `${range[0]}-${range[1]} of ${total} tickets`,
                                                }}
                                                dataSource={tableData}
                                                columns={columns}
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

export default SupportTicketPage;