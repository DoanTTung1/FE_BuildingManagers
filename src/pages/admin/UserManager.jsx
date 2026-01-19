import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Avatar, Tag, Modal, Tooltip, message, Badge
} from 'antd';
import {
    SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, CheckCircleTwoTone
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// 👇 QUAN TRỌNG: Kiểm tra lại đường dẫn này tùy theo cấu trúc thư mục của bạn
// Nếu file này ở src/pages/admin/UserManager.jsx -> dùng ../../api/axiosClient
import axiosClient from '../../api/axiosClient';

const UserManager = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // --- 1. CALL API ---
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Gọi API: GET /api/users
            const res = await axiosClient.get('/api/users');
            // Đảm bảo dữ liệu luôn là mảng, tránh lỗi map()
            setUsers(Array.isArray(res) ? res : []);
        } catch (error) {
            message.error("Không thể tải danh sách nhân viên!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. XỬ LÝ XÓA ---
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/users/${id}`);
                    message.success('Xóa thành công!');
                    fetchUsers(); // Tải lại danh sách sau khi xóa
                } catch (error) {
                    message.error('Xóa thất bại! Có thể tài khoản đang có dữ liệu liên quan.');
                }
            }
        });
    };

    // --- 3. CẤU HÌNH CỘT CHO BẢNG (ANT DESIGN TABLE) ---
    const columns = [
        {
            title: 'Thông tin tài khoản',
            dataIndex: 'fullName',
            key: 'info',
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.avatar}
                        icon={<UserOutlined />}
                        size={48}
                        style={{ backgroundColor: '#87d068' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Ưu tiên hiện FullName, nếu không có thì hiện Username */}
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>
                            {record.fullName || record.username}
                        </span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            @{record.username}
                        </span>
                    </div>
                </Space>
            ),
            // Tính năng tìm kiếm (Client-side)
            filteredValue: [searchText],
            onFilter: (value, record) => {
                if (!value) return true;
                const searchStr = value.toLowerCase();
                return (
                    String(record.fullName || '').toLowerCase().includes(searchStr) ||
                    String(record.username || '').toLowerCase().includes(searchStr) ||
                    String(record.email || '').toLowerCase().includes(searchStr)
                );
            },
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MailOutlined style={{ color: '#1890ff' }} />
                        <span>{record.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneOutlined style={{ color: '#52c41a' }} />
                        <span>{record.phone}</span>
                        {/* Check xem SĐT đã xác thực chưa (nếu DTO có trả về) */}
                        {record.phoneVerified && (
                            <Tooltip title="Đã xác thực SĐT">
                                <CheckCircleTwoTone twoToneColor="#52c41a" />
                            </Tooltip>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles', // Cột này sẽ lấy List<String> roles từ API
            key: 'roles',
            render: (roles) => (
                <>
                    {/* Kiểm tra nếu roles tồn tại mới map */}
                    {roles && roles.map((role) => {
                        let color = 'geekblue';
                        if (role === 'ADMIN') color = 'volcano';
                        if (role === 'STAFF') color = 'blue';
                        if (role === 'USER') color = 'green';
                        return (
                            <Tag color={color} key={role} style={{ fontWeight: 'bold' }}>
                                {role.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                status === 1
                    ? <Badge status="success" text="Hoạt động" />
                    : <Badge status="error" text="Đã khóa" />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => message.info("Chức năng sửa đang cập nhật!")}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa nhân viên">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '80vh' }}>
            {/* --- HEADER CÔNG CỤ --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <h2 style={{ margin: 0, color: '#001529', fontWeight: 'bold', fontSize: '24px' }}>Quản Lý Người Dùng</h2>
                    <Badge count={users.length} overflowCount={999} style={{ backgroundColor: '#52c41a' }} />
                </div>

                <Space>
                    <Input
                        placeholder="Tìm theo tên, email..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/admin/users/create')}
                        style={{ backgroundColor: '#001529' }}
                    >
                        Thêm Nhân Viên
                    </Button>
                </Space>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} nhân viên`
                }}
                locale={{ emptyText: 'Không có dữ liệu người dùng' }}
            />
        </div>
    );
};

export default UserManager;