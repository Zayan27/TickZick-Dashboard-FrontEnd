import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { DataService } from '../../config/dataService/dataService';
import { getItem } from "../../utility/localStorageControl";
import { Link } from 'react-router-dom';
import OverviewCard from '../../components/cards/OverviewCard';

function Dashboard() {
    const authRole = getItem("auth_role");
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        events_count: 0,
        tickets_count: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await DataService.get(`/${authRole}/dashboard`);

            if (response.data?.status) {
                setDashboardData({
                    events_count: response.data.data?.events_count || response.data.events_count || 0,
                    tickets_count: response.data.data?.tickets_count || response.data.tickets_count || 0
                });
            } else {
                // Fallback if response structure is different
                setDashboardData({
                    events_count: response.data?.events_count || 0,
                    tickets_count: response.data?.tickets_count || 0
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[715px] lg:min-h-[580px] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
                {/* Stats Cards using OverviewCard */}
                <Row gutter={25} className="mb-8 mt-8">
                    <Col xxl={12} lg={12} xs={24}>
                        <Link to={`/${authRole}/events`}>
                            <OverviewCard
                                data={{
                                    type: 'primary',
                                    icon: 'ticket.svg',
                                    label: 'Total Events',
                                    total: dashboardData.events_count,
                                    status: 'growth',
                                    statusRate: 0,
                                    dataPeriod: 'Today',
                                    suffix: '',
                                    prefix: '',
                                    decimels: 0,
                                    statusColor: 'success',
                                    separator: ','
                                }}
                                bottomStatus={false}
                                contentFirst={false}
                                halfCircleIcon={false}
                            />
                        </Link>
                    </Col>

                    <Col xxl={12} lg={12} xs={24}>
                        <Link to={`/${authRole}/tickets`}>
                            <OverviewCard
                                data={{
                                    type: 'secondary',
                                    icon: 'message.svg',
                                    label: 'Total Tickets',
                                    total: dashboardData.tickets_count,
                                    status: 'growth',
                                    statusRate: 0,
                                    dataPeriod: 'Today',
                                    suffix: '',
                                    prefix: '',
                                    decimels: 0,
                                    statusColor: 'success',
                                    separator: ','
                                }}
                                bottomStatus={false}
                                contentFirst={false}
                                halfCircleIcon={false}
                            />
                        </Link>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default Dashboard;