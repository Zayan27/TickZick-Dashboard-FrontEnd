import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Table,
    Spin,
    Modal,
    Input,
    message
} from 'antd';
import { Link, NavLink, useNavigate} from 'react-router-dom';
import { UilPlus, UilSearch, UilEdit, UilTrash, UilEye, UilTimesCircle } from '@iconscout/react-unicons';
import { GlobalUtilityStyle, PaginationStyle } from '../../../container/styled';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { DataService } from "../../../config/dataService/dataService";
import { getItem } from "../../../utility/localStorageControl";


function EventCancel() {
    const [events, setEvents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const user = getItem("auth_user");
    const authRole = getItem("auth_role");


    const loadData = async () => {
        setLoading(true);

        try {
            const res = await DataService.get(
                `/${authRole}/event-cancellation-requests`
            );

            console.log("Cancellation API response:", res.data);

            if (res.data?.success) {
                const requests = res.data?.cancellation_requests || [];

                console.log("Cancellation requests:", requests);

                setEvents(requests);
                setFiltered(requests);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await DataService.post(`/${authRole}/events/${id}/delete`);
            loadData();
        } catch (error) {
            console.log("Delete error:", error);
        }
    };

    const handleCancel = (event) => {
        setSelectedEvent(event);
        setCancellationReason("");
        setCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        if (!selectedEvent) return;

        const isLive =
            authRole === "organizer" &&
            selectedEvent.display_status === "active";

        // Reason is required only for LIVE organizer events
        if (isLive && !cancellationReason.trim()) {
            message.error("Cancellation reason is required.");
            return;
        }

        setCancelling(true);

        try {
            const payload =
                isLive
                    ? {
                        reason: cancellationReason.trim()
                    }
                    : {};

            const response = await DataService.post(
                `/${authRole}/events/${selectedEvent.id}/cancel`,
                payload
            );

            const data = response?.data;

            if (data?.success) {
                message.success(data.message);

                setCancelModalOpen(false);
                setSelectedEvent(null);
                setCancellationReason("");

                loadData();
            } else {
                debugger;
                message.error(
                    data?.message || "Unable to cancel event."
                );
            }
        } catch (error) {
            console.error("Cancel event error:", error);

            message.error(
                error?.response?.data?.message ||
                "Something went wrong while cancelling the event."
            );
        } finally {
            setCancelling(false);
        }
    };

    const onHandleSearch = (e) => {
        const search = e.target.value.toLowerCase();

        const result = events.filter((request) =>
            (request.event?.title || "").toLowerCase().includes(search) ||
            (request.reason || "").toLowerCase().includes(search) ||
            (request.status_label || "").toLowerCase().includes(search) ||
            (request.organizer?.name || "").toLowerCase().includes(search) ||
            (request.organizer?.email || "").toLowerCase().includes(search)
        );

        setFiltered(result);
    };
    const handleEventCreate = () => {
        const frontUrl = process.env.REACT_APP_FRONT_URL;
        navigate(`${frontUrl}/events/create`);
    };

    const [state, setState] = useState({
        selectedRowKeys: [],
    });
    const { selectedRowKeys } = state;

    const dataSource = [];

    if (filtered.length)
        filtered.map((request, index) => {
            const event = request.event || {};
            const organizer = request.organizer || {};
            const cancellation_id = request?.id || '';
            const {
                id,
                title,
                start_date,
                end_date,
                status,
                is_cancelled
            } = event;

            const {
                reason,
                status_label,
                created_at
            } = request;

            return dataSource.push({
                key: request.id,

                title: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {title || "-"}
                    </span>
                ),

                organizer: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {organizer.name || "-"}
                        <br />
                        <span className="text-xs text-gray-500">
                            {organizer.email || ""}
                        </span>
                    </span>
                ),

                reason: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {reason || "-"}
                    </span>
                ),

                sdate: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {start_date || "-"}
                    </span>
                ),

                edate: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {end_date || "-"}
                    </span>
                ),

                status: (
                    <span
                        className={`inline-flex items-center justify-center min-h-[24px] px-3 text-xs font-medium rounded-[15px]
                            ${
                                request.status === "pending"
                                    ? "bg-warning-transparent text-warning"
                                    : request.status === "approved"
                                    ? "bg-success-transparent text-success"
                                    : request.status === "rejected"
                                    ? "bg-danger-transparent text-danger"
                                    : "bg-gray-transparent text-gray"
                            }`}
                    >
                        {status_label || request.status || "-"}
                    </span>
                ),

                created_at: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {created_at || "-"}
                    </span>
                ),

                action: (
                    <div className="flex items-center gap-3 justify-center">

                        {/* View Event */}
                        <Link
                            className="text-light-extra dark:text-white60"
                            to={`/${authRole}/cancel-requests/show/${cancellation_id}`}
                            title="View Event"
                        >
                            <UilEye className="w-4 h-4" />
                        </Link>

                    </div>
                ),
            });
        });


    const columns = [
        {
            title: "Event",
            dataIndex: "title",
            key: "title"
        },
        {
            title: "Organizer",
            dataIndex: "organizer",
            key: "organizer"
        },
        {
            title: "Reason",
            dataIndex: "reason",
            key: "reason"
        },
        {
            title: "Start Date",
            dataIndex: "sdate",
            key: "sdate"
        },
        {
            title: "End Date",
            dataIndex: "edate",
            key: "edate"
        },
        {
            title: "Request Status",
            dataIndex: "status",
            key: "status"
        },
        {
            title: "Requested At",
            dataIndex: "created_at",
            key: "created_at"
        },
        {
            title: "Actions",
            dataIndex: "action",
            key: "action"
        }
    ];

    const onSelectChange = (selectedRowKey) => {
        setState({ ...state, selectedRowKeys: selectedRowKey });
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <div>
            <PageHeader
                className="flex items-center justify-between px-[30px] py-[25px] bg-transparent [&>div>div>.ant-page-header-heading-title]:text-[22px] [&>div>div>.ant-page-header-heading-title]:font-semibold [&>div>div>.ant-page-header-heading-title]:text-dark dark:[&>div>div>.ant-page-header-heading-title]:text-white leading-[32px] [&>div>div]:flex [&>div>div]:items-center gap-[12px] [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:w-full [&>div]:gap-[10px] [&>div>.ant-page-header-heading-left]:m-0 [&>div>.ant-page-header-heading-left]:gap-[12px]"
                subTitle={
                    authRole === "organizer" && (
                        <NavLink
                            onClick={handleEventCreate}
                            className="bg-primary hover:bg-hbr-primary border-solid border-1 border-primary text-white dark:text-white87 text-[14px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-[4px] px-[20px] h-[44px] shadow-btn gap-[8px]"
                        >
                            <UilPlus className="w-[15px] h-[15px]" /> <span>Add New</span>
                        </NavLink>
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
                            placeholder="Search Here"
                        />
                    </div>,
                ]}
                ghost
                title="Data List"
            />
            <div className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                <Row gutter={15}>
                    <Col className="w-100" md={24}>
                        <div className="bg-white dark:bg-white10 p-[25px] rounded-[10px]">
                            {loading ? (
                                <div className="flex items-center justify-center [&>div]:flex [&>div]:items-center">
                                    <Spin />
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
                                            />
                                        </div>
                                    </PaginationStyle>
                                </GlobalUtilityStyle>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Cancel Event"
                open={cancelModalOpen}
                onCancel={() => {
                    if (!cancelling) {
                        setCancelModalOpen(false);
                        setSelectedEvent(null);
                        setCancellationReason("");
                    }
                }}
                onOk={confirmCancel}
                okText="Cancel Event"
                cancelText="Close"
                okButtonProps={{
                    danger: true,
                    loading: cancelling
                }}
                maskClosable={!cancelling}
                closable={!cancelling}
            >
                <div className="py-3">

                    <p className="mb-4">
                        Are you sure you want to cancel{" "}
                        <strong>
                            {selectedEvent?.title}
                        </strong>
                        ?
                    </p>

                    {authRole === "organizer" &&
                        selectedEvent?.display_status === "active" && (
                            <div>
                                <label className="block mb-2 font-medium">
                                    Cancellation Reason
                                    <span className="text-danger ml-1">*</span>
                                </label>

                                <Input.TextArea
                                    rows={4}
                                    value={cancellationReason}
                                    onChange={(e) =>
                                        setCancellationReason(e.target.value)
                                    }
                                    placeholder="Enter the reason for cancelling this event..."
                                    maxLength={500}
                                    showCount
                                />

                                <p className="text-xs text-gray-500 mt-2">
                                    Since this event is LIVE, your cancellation
                                    request will be sent to admin for approval.
                                </p>
                            </div>
                        )}

                    {authRole === "organizer" &&
                        selectedEvent?.display_status !== "active" && (
                            <p className="text-gray-500">
                                This event will be cancelled immediately.
                                Booked customers will be notified.
                            </p>
                        )}

                    {authRole === "admin" && (
                        <p className="text-gray-500">
                            This event will be cancelled immediately.
                            Booked customers will be notified.
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default EventCancel;