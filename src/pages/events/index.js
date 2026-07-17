import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Spin } from 'antd';
import { Link, NavLink, useNavigate} from 'react-router-dom';
import { UilPlus, UilSearch, UilEdit, UilTrash, UilEye } from '@iconscout/react-unicons';
import { GlobalUtilityStyle, PaginationStyle } from '../../container/styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { DataService } from "../../config/dataService/dataService";
import { getItem } from "../../utility/localStorageControl";


function EventPage() {
    const [events, setEvents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const user = getItem("auth_user");
    const authRole = getItem("auth_role");
    

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await DataService.get(`/${authRole}/events`);
            if (res.data.status) {
                setEvents(res.data.events || []);
                setFiltered(res.data.events || []);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
        setLoading(false);
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

    const onHandleSearch = (e) => {
        const search = e.target.value.toLowerCase();

        const result = events.filter(ev =>
            (ev.title || "").toLowerCase().includes(search) ||
            (ev.event_category || "").toLowerCase().includes(search) ||
            (ev.city || "").toLowerCase().includes(search) ||
            (ev.country || "").toLowerCase().includes(search)
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
        filtered.map((event, index) => {
            const { id, thumbnail, title, event_category, start_date, end_date, address, city, country, email, phone_number, status } = event;

            return dataSource.push({
                key: index + 1,
                image: (
                    <div className="flex items-center">
                        <figure className="mx-2 mb-0">
                            <img
                                className="w-10 h-10 rounded object-cover"
                                src={thumbnail ? thumbnail : require('../../static/img/avatar/profileImage.png')}
                                alt={id}
                            />
                        </figure>
                    </div>
                ),
                title: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {title}
                    </span>
                ),
                category: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {event_category}
                    </span>
                ),
                address: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {address} <br />
                        {city && country ? `${city}, ${country}` : ""}
                    </span>
                ),
                contact: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {email}
                        <br />
                        {phone_number}
                    </span>
                ),
                sdate: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {start_date}
                    </span>
                ),
                edate: (
                    <span className="text-body dark:text-white60 text-[15px] font-medium">
                        {end_date}
                    </span>
                ),
                status: (
                    <span className={`inline-flex items-center justify-center bg-${status}-transparent text-${status} min-h-[24px] px-3 text-xs font-medium rounded-[15px]`}>
                        {status === "1" ? "Active" : "Inactive"}
                    </span>
                ),
                action: (
                    <div className="flex items-center gap-3 justify-start">
                        <Link
                            className="text-light-extra dark:text-white60"
                            to={`/${authRole}/events/show/${id}`}
                        >
                            <UilEye className="w-4 h-4" />
                        </Link>
                        {authRole === 'organizer' && (
                            <Link
                                className="text-light-extra dark:text-white60"
                                to={`/${authRole}/events/edit/${id}`}
                            >
                                <UilEdit className="w-4 h-4" />
                            </Link>
                        )}
                        <button
                            className="text-light-extra dark:text-white60"
                            onClick={() => handleDelete(id)}
                        >
                            <UilTrash className="w-4 h-4" />
                        </button>
                    </div>
                ),
            });
        });


    const columns = [
        { title: 'Image', dataIndex: 'image', key: 'image' },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        { title: 'Contact', dataIndex: 'contact', key: 'contact' },
        { title: 'Start Date', dataIndex: 'sdate', key: 'sdate' },
        { title: 'End Date', dataIndex: 'edate', key: 'edate' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Actions', dataIndex: 'action', key: 'action', width: '90px' },
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
        </div>
    );
}

export default EventPage;