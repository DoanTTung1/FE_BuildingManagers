import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Modal, message, Tag, Tooltip, Typography, Select
} from 'antd';
import {
    PlusOutlined, SearchOutlined, EditOutlined,
    DeleteOutlined, UsergroupAddOutlined, HomeOutlined,
    UndoOutlined, RestOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AssignmentModal from '../../components/admin/AssignmentModal';

const { Title } = Typography;
const { Option } = Select;

const BuildingManager = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // State lọc trạng thái: null (hoặc không gửi) = Active, 0 = Thùng rác
    const [filterStatus, setFilterStatus] = useState(null);

    const [assignmentBuildingId, setAssignmentBuildingId] = useState(null);

    // Khi filterStatus thay đổi -> Tự động load lại dữ liệu
    useEffect(() => {
        fetchBuildings();
    }, [filterStatus]);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            // Gọi API kèm theo tham số status (nếu có)
            // Backend sẽ tự xử lý: status=0 -> lấy thùng rác, null -> lấy ds active
            const res = await axiosClient.get('/api/buildings/admin', {
                params: {
                    status: filterStatus
                }
            });

            setBuildings(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            message.error("Lỗi tải dữ liệu tòa nhà!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- XÓA MỀM (Đưa vào thùng rác) ---
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xóa tòa nhà',
            content: 'Tòa nhà sẽ được chuyển vào thùng rác. Bạn có chắc chắn không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/buildings/${id}`);
                    message.success("Đã chuyển vào thùng rác!");
                    fetchBuildings();
                } catch (error) {
                    message.error("Lỗi khi xóa! Có thể bạn không đủ quyền.");
                }
            }
        });
    };

    // --- XÓA VĨNH VIỄN (Trong thùng rác) ---
    const handleHardDelete = (id) => {
        Modal.confirm({
            title: 'CẢNH BÁO: Xóa vĩnh viễn',
            content: 'Hành động này KHÔNG THỂ khôi phục. Dữ liệu phân công cũng sẽ bị xóa. Bạn chắc chứ?',
            okText: 'Xóa vĩnh viễn',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/buildings/hard/${id}`);
                    message.success("Đã xóa vĩnh viễn dữ liệu!");
                    fetchBuildings();
                } catch (error) {
                    message.error("Lỗi khi xóa vĩnh viễn!");
                }
            }
        });
    };

    // --- KHÔI PHỤC (Restore) ---
    const handleRestore = async (id) => {
        try {
            await axiosClient.put(`/api/buildings/${id}/restore`);
            message.success("Khôi phục tòa nhà thành công!");
            fetchBuildings();
        } catch (error) {
            message.error("Lỗi khi khôi phục!");
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/building-edit/${id}`);
    };

    // --- CẤU HÌNH CỘT BẢNG ---
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Tên Tòa Nhà',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <HomeOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 600, color: '#001529' }}>{text}</span>
                </Space>
            ),
            filteredValue: [searchText],
            onFilter: (value, record) => {
                if (!value) return true;
                const searchStr = value.toLowerCase();
                return (
                    String(record.name || '').toLowerCase().includes(searchStr) ||
                    String(record.address || '').toLowerCase().includes(searchStr)
                );
            },
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Giá Thuê',
            dataIndex: 'rentPrice',
            key: 'rentPrice',
            render: (price) => (
                <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'USD' }).format(price)}
                </span>
            ),
            sorter: (a, b) => a.rentPrice - b.rentPrice,
        },
        {
            title: 'Diện Tích',
            dataIndex: 'floorArea',
            key: 'floorArea',
            render: (area) => area ? <Tag color="geekblue">{area} m²</Tag> : <Tag>N/A</Tag>,
        },
        {
            title: 'Hành Động',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    {/* LOGIC HIỂN THỊ NÚT BẤM DỰA VÀO TRẠNG THÁI FILTER */}
                    {filterStatus === 0 ? (
                        // --- VIEW THÙNG RÁC ---
                        <>
                            <Tooltip title="Khôi phục">
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
                            <Tooltip title="Giao việc">
                                <Button
                                    style={{ borderColor: '#13c2c2', color: '#13c2c2' }}
                                    icon={<UsergroupAddOutlined />}
                                    onClick={() => setAssignmentBuildingId(record.id)}
                                />
                            </Tooltip>

                            <Tooltip title="Sửa">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record.id)}
                                />
                            </Tooltip>

                            <Tooltip title="Xóa">
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
        <div style={{ padding: 24, background: '#fff', borderRadius: 10, minHeight: '80vh', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={3} style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>Quản Lý Tòa Nhà</Title>

                    {/* DROPDOWN CHỌN TRẠNG THÁI */}
                    <Select
                        defaultValue={null}
                        style={{ width: 160 }}
                        onChange={(val) => setFilterStatus(val)}
                    >
                        <Option value={null}>🟢 Đang hoạt động</Option>
                        <Option value={0}>🗑️ Thùng rác</Option>
                    </Select>
                </div>

                <Space>
                    <Input
                        placeholder="Tìm theo tên, địa chỉ..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ backgroundColor: '#001529' }}
                        onClick={() => navigate('/post-building')}
                        disabled={filterStatus === 0} // Không cho thêm mới khi đang ở thùng rác
                    >
                        Thêm Tòa Nhà
                    </Button>
                </Space>
            </div>

            {/* --- TABLE --- */}
            <Table
                columns={columns}
                dataSource={buildings}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 6, showTotal: (total) => `Tổng ${total} tòa nhà` }}
                locale={{ emptyText: filterStatus === 0 ? 'Thùng rác trống' : 'Chưa có dữ liệu tòa nhà' }}
            />

            {/* --- MODAL --- */}
            {assignmentBuildingId && (
                <AssignmentModal
                    buildingId={assignmentBuildingId}
                    onClose={() => setAssignmentBuildingId(null)}
                />
            )}
        </div>
    );
};

export default BuildingManager;