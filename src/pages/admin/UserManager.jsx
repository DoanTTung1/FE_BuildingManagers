import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Avatar, Tag, Modal, Tooltip, message, Badge, Select, Typography
} from 'antd';
import {
    SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, CheckCircleTwoTone,
    UndoOutlined, RestOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const { Title } = Typography;
const { Option } = Select;

const UserManager = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // State lọc trạng thái: null = Active, 0 = Thùng rác
    const [filterStatus, setFilterStatus] = useState(null);

    // --- 1. CALL API (Tự động chạy khi filter thay đổi) ---
    useEffect(() => {
        fetchUsers();
    }, [filterStatus]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Gọi API kèm status để lọc (Backend cần hỗ trợ nhận param này)
            const res = await axiosClient.get('/api/users', {
                params: { status: filterStatus }
            });
            setUsers(Array.isArray(res) ? res : []);
        } catch (error) {
            message.error("Không thể tải danh sách nhân viên!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. CÁC HÀM XỬ LÝ HÀNH ĐỘNG ---

    // Xóa mềm (Đưa vào thùng rác)
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xóa nhân viên',
            content: 'Tài khoản này sẽ bị vô hiệu hóa và chuyển vào thùng rác. Bạn chắc chứ?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/users/${id}`);
                    message.success('Đã chuyển vào thùng rác!');
                    fetchUsers();
                } catch (error) {
                    message.error('Lỗi khi xóa! Có thể tài khoản đang có dữ liệu liên quan.');
                }
            }
        });
    };

    // Xóa vĩnh viễn
    const handleHardDelete = (id) => {
        Modal.confirm({
            title: 'CẢNH BÁO: Xóa vĩnh viễn',
            content: 'Hành động này KHÔNG THỂ hoàn tác. Bạn có chắc chắn muốn xóa bay màu tài khoản này?',
            okText: 'Xóa vĩnh viễn',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    // Giả định backend có API này: DELETE /api/users/hard/{id}
                    await axiosClient.delete(`/api/users/hard/${id}`);
                    message.success('Đã xóa vĩnh viễn!');
                    fetchUsers();
                } catch (error) {
                    message.error('Lỗi khi xóa vĩnh viễn!');
                }
            }
        });
    };

    // Khôi phục (Restore)
    const handleRestore = async (id) => {
        try {
            // Giả định backend có API này: PUT /api/users/{id}/restore
            await axiosClient.put(`/api/users/${id}/restore`);
            message.success("Khôi phục tài khoản thành công!");
            fetchUsers();
        } catch (error) {
            message.error("Lỗi khi khôi phục!");
        }
    };

    // Chuyển hướng sang trang sửa
    const handleEdit = (id) => {
        navigate(`/admin/users/edit/${id}`);
    };

    // --- 3. CẤU HÌNH CỘT CHO BẢNG ---
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
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>
                            {record.fullName || record.username}
                        </span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            @{record.username}
                        </span>
                    </div>
                </Space>
            ),
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
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) => (
                <>
                    {roles && roles.map((role) => {
                        let color = 'geekblue';
                        if (role === 'ADMIN') color = 'volcano';
                        if (role === 'STAFF') color = 'blue';
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
                    {filterStatus === 0 ? (
                        // --- VIEW THÙNG RÁC ---
                        <>
                            <Tooltip title="Khôi phục tài khoản">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                    icon={<UndoOutlined />}
                                    onClick={() => handleRestore(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa vĩnh viễn">
                                <Button
                                    danger
                                    icon={<RestOutlined />}
                                    onClick={() => handleHardDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    ) : (
                        // --- VIEW BÌNH THƯỜNG ---
                        <>
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa nhân viên">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '80vh' }}>
            {/* --- HEADER CÔNG CỤ --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>Quản Lý Nhân Viên</Title>

                    {/* DROPDOWN LỌC TRẠNG THÁI */}
                    <Select
                        defaultValue={null}
                        style={{ width: 160 }}
                        onChange={(val) => setFilterStatus(val)}
                    >
                        <Option value={null}>🟢 Đang hoạt động</Option>
                        <Option value={0}>🗑️ Thùng rác</Option>
                    </Select>

                    <Badge count={users.length} overflowCount={999} style={{ backgroundColor: filterStatus === 0 ? '#ff4d4f' : '#52c41a' }} />
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
                        disabled={filterStatus === 0} // Không cho thêm mới khi đang ở thùng rác
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
                    pageSize: 6,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} tài khoản`
                }}
                locale={{ emptyText: filterStatus === 0 ? 'Thùng rác trống' : 'Không có dữ liệu người dùng' }}
            />
        </div>
    );
};

export default UserManager;