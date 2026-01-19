import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Tag } from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    ToolOutlined,
    DollarCircleOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import statisticApi from '../../../api/statisticApi';

// Màu sắc cho biểu đồ tròn
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statisticApi.getDashboardStats();
                setStats(response);
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ textAlign: 'center', marginTop: '20%', height: '100vh' }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );

    // Component Card nhỏ hiển thị số liệu
    const StatCard = ({ title, value, icon, color, prefix, isCurrency }) => (
        <Card bordered={false} style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 10 }}>
            <Statistic
                title={<span style={{ color: '#8c8c8c', fontWeight: 600 }}>{title}</span>}
                value={value}
                precision={isCurrency ? 0 : 0}
                formatter={(val) => isCurrency ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : val}
                valueStyle={{ color: color, fontWeight: 'bold', fontSize: '24px' }}
                prefix={icon}
                suffix={prefix ? <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 10 }}><ArrowUpOutlined /></span> : null}
            />
        </Card>
    );

    // Cấu hình các cột cho bảng "Tòa nhà mới"
    const columns = [
        {
            title: 'Tên Tòa Nhà',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true, // Tự động cắt nếu dài quá
        },
        {
            title: 'Giá thuê',
            dataIndex: 'rentPrice',
            key: 'rentPrice',
            render: (price) => (
                <Tag color="green">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </Tag>
            )
        },
        {
            title: 'Quản lý',
            dataIndex: 'managerName',
            key: 'managerName',
            render: (name) => name || <span style={{ color: '#ccc' }}>Chưa phân công</span>
        },
    ];

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: 24, color: '#262626', fontWeight: 700 }}>Dashboard Tổng Quan</h2>

            {/* --- PHẦN 1: 4 CARD SỐ LIỆU --- */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Tổng Tòa Nhà"
                        value={stats?.countBuildings || 0}
                        icon={<ShopOutlined style={{ fontSize: 24, marginRight: 8, backgroundColor: '#e6f7ff', padding: 8, borderRadius: '50%', color: '#1890ff' }} />}
                        color="#262626"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Khách Hàng"
                        value={stats?.countCustomers || 0}
                        icon={<UserOutlined style={{ fontSize: 24, marginRight: 8, backgroundColor: '#f6ffed', padding: 8, borderRadius: '50%', color: '#52c41a' }} />}
                        color="#262626"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Yêu Cầu Bảo Trì"
                        value={stats?.countMaintenance || 0}
                        icon={<ToolOutlined style={{ fontSize: 24, marginRight: 8, backgroundColor: '#fff7e6', padding: 8, borderRadius: '50%', color: '#faad14' }} />}
                        color="#262626"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Tổng Doanh Thu"
                        value={stats?.totalRevenue || 0}
                        isCurrency={true}
                        icon={<DollarCircleOutlined style={{ fontSize: 24, marginRight: 8, backgroundColor: '#fff1f0', padding: 8, borderRadius: '50%', color: '#f5222d' }} />}
                        color="#cf1322"
                        prefix={true}
                    />
                </Col>
            </Row>

            {/* --- PHẦN 2: BIỂU ĐỒ DOANH THU & TỶ LỆ --- */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                {/* Biểu đồ cột: Doanh thu theo tháng */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Biểu đồ doanh thu 6 tháng gần nhất"
                        bordered={false}
                        style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats?.monthlyRevenues || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        fill="#1890ff"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Biểu đồ tròn: Trạng thái (Demo) */}
                <Col xs={24} lg={8}>
                    <Card title="Tỷ lệ lấp đầy" bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                        <div style={{ width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Đã thuê', value: 75 },
                                            { name: 'Còn trống', value: 25 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#1890ff" />
                                        <Cell fill="#f0f2f5" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                    {/* Số % ở giữa biểu đồ */}
                                    <text x="50%" y="50%" dy={-5} textAnchor="middle" fill="#333" fontSize={24} fontWeight="bold">
                                        75%
                                    </text>
                                    <text x="50%" y="50%" dy={20} textAnchor="middle" fill="#999" fontSize={14}>
                                        Đã thuê
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* --- PHẦN 3: BẢNG TÒA NHÀ MỚI --- */}
            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Các tòa nhà mới thêm gần đây" bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Table
                            dataSource={stats?.recentBuildings || []}
                            columns={columns}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;