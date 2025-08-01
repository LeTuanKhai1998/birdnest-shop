import React from 'react';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  PAID: 'bg-blue-100 text-blue-800 border-blue-200',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
  USER: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function StatusBadge({ status }: { status: string }) {
  const color =
    STATUS_COLORS[status.toUpperCase()] ||
    'bg-gray-100 text-gray-800 border-gray-200';
  
  // Custom labels for better UX
  const getLabel = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Vô hiệu';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'PAID':
        return 'Đã thanh toán';
      case 'SHIPPED':
        return 'Đã gửi';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${color}`}
    >
      {getLabel(status)}
    </span>
  );
}
