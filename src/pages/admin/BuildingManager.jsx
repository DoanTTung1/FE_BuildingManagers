import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Input, Space, Modal, message, Tag, Tooltip, Typography 
} from 'antd';
import { 
    PlusOutlined, SearchOutlined, EditOutlined, 
    DeleteOutlined, UsergroupAddOutlined, HomeOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AssignmentModal from '../../components/admin/AssignmentModal';

const { Title } = Typography;

const BuildingManager = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [assignmentBuildingId, setAssignmentBuildingId] = useState(null);

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            // 👇 QUAN TRỌNG: Đã sửa lại đúng API của bạn (/admin)
            const res = await axiosClient.get('/api/buildings/admin'); 
            
            // Xử lý an toàn: Nếu API trả về mảng thì dùng, không thì lấy mảng rỗng
            setBuildings(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            message.error("Lỗi tải dữ liệu tòa nhà!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xóa tòa nhà',
            content: 'Bạn có chắc chắn muốn xóa MỀM tòa nhà này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/buildings/${id}`);
                    message.success("Xóa thành công!");
                    fetchBuildings(); 
                } catch (error) {
                    message.error("Lỗi khi xóa! (Có thể bạn không phải Admin)");
                }
            }
        });
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
            // Tìm kiếm theo tên
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
                    {/* Format tiền tệ VND */}
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
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 10, minHeight: '80vh', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>Quản Lý Tòa Nhà</Title>
                
                <Space>
                    <Input 
                        placeholder="Tìm theo tên, địa chỉ..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        style={{ backgroundColor: '#001529' }}
                        onClick={() => navigate('/post-building')}
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
                pagination={{ pageSize: 5, showTotal: (total) => `Tổng ${total} tòa nhà` }}
                locale={{ emptyText: 'Chưa có dữ liệu tòa nhà' }}
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