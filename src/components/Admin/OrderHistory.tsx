import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ShoppingCart,
  Calendar,
  DollarSign,
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface OrderItem {
  id: string;
  medication_id: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  medications: {
    name: string;
    dosage_form: string;
    strength: string;
  };
}

interface Order {
  id: string;
  doctor_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
  medication_order_items: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    calculateStats();
  }, [orders, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medication_orders')
        .select(`
          *,
          user_profiles!medication_orders_doctor_id_fkey (
            full_name,
            email
          ),
          medication_order_items (
            *,
            medications (
              name,
              dosage_form,
              strength
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === statusFilter));
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('medication_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      alert('Order status updated successfully');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'processing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'shipped'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'delivered'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Delivered
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">
                        {order.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user_profiles.full_name}
                        </div>
                        <div className="text-xs text-gray-500">{order.user_profiles.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {parseFloat(order.total_amount.toString()).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                        }
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                      Medication
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                      Quantity
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                      Price
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {order.medication_order_items.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">
                                          {item.medications.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.medications.strength} - {item.medications.dosage_form}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.quantity}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        ${parseFloat(item.price_at_purchase.toString()).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                        ${parseFloat(item.subtotal.toString()).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                              {order.shipping_address}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
