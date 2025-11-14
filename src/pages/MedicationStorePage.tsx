import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Filter,
  Search,
  AlertCircle,
  CreditCard,
  MapPin,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  Pill,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Medication {
  id: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  dosage_form: string;
  strength: string;
  prescription_required: boolean;
  active_ingredients: string;
  side_effects: string;
  warnings: string;
  is_available: boolean;
}

interface CartItem {
  id: string;
  medication_id: string;
  quantity: number;
  medication: Medication;
}

export function MedicationStore() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    loadMedications();
    loadCart();
  }, []);

  const loadMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('medication_cart')
        .select(`
          id,
          medication_id,
          quantity,
          medication:medications(*)
        `)
        .eq('doctor_id', profile.id);

      if (error) throw error;
      setCart((data as any) || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (medication: Medication) => {
    if (!profile) return;

    try {
      // Check if item already in cart
      const existingItem = cart.find(item => item.medication_id === medication.id);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('medication_cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('medication_cart')
          .insert({
            doctor_id: profile.id,
            medication_id: medication.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      await loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('medication_cart')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('medication_cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (!profile || cart.length === 0 || !shippingAddress) return;

    setProcessingOrder(true);

    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            cart: cart,
            shippingAddress: shippingAddress,
            orderNotes: orderNotes,
            email: profile.email,
          },
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!functionData?.url) {
        throw new Error('No checkout URL returned from Stripe');
      }

      // Redirect to Stripe Checkout page
      window.location.href = functionData.url;

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
      setProcessingOrder(false);
    }
  };

  const categories = ['all', ...new Set(medications.map(m => m.category))];

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         med.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.medication.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/doctor-dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
                <Pill className="w-10 h-10 text-teal-600" />
                Medication Store
              </h1>
              <p className="text-gray-600">
                Browse and order medications for your practice
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold border-2 border-teal-600"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow border-l-4 border-red-500 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map(medication => (
            <div
              key={medication.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-teal-500"
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 h-40 flex items-center justify-center border-b-2 border-teal-100">
                <Package className="w-20 h-20 text-teal-600" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{medication.name}</h3>
                    <p className="text-sm text-gray-500">{medication.manufacturer}</p>
                  </div>
                  <span className="bg-teal-100 text-teal-800 text-xs font-medium px-3 py-1 rounded-full border border-teal-300">
                    {medication.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medication.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Dosage:</span>
                    <span className="font-semibold text-gray-900">{medication.dosage_form} - {medication.strength}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-semibold ${medication.stock_quantity > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                      {medication.stock_quantity} units
                    </span>
                  </div>
                  {medication.prescription_required && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      Prescription Required
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                  <div>
                    <p className="text-2xl font-semibold text-teal-600">${medication.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(medication)}
                    disabled={medication.stock_quantity === 0}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold border border-teal-600"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No medications found</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Your Cart
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600">{cartItemCount} items</p>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{item.medication.name}</h3>
                            <p className="text-sm text-gray-500">{item.medication.strength}</p>
                            <p className="text-lg font-bold text-green-600 mt-2">
                              ${item.medication.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-gray-200 p-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="font-bold text-gray-900">
                              ${(item.medication.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!showCheckout ? (
                    <div className="sticky bottom-0 bg-white border-t-2 border-red-400 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-semibold text-teal-600">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md font-semibold text-lg border-2 border-teal-600"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Checkout</h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Shipping Address *
                        </label>
                        <textarea
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Enter your complete shipping address"
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special instructions?"
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-4 border-l-4 border-cyan-500 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-5 h-5 text-cyan-700" />
                          <span className="font-semibold text-gray-900">Secure Payment via Stripe</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          You'll be redirected to Stripe's secure checkout page to complete your payment.
                        </p>
                      </div>

                      <div className="border-t-2 border-gray-200 pt-6">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-l-4 border-teal-500 mb-6">
                          <span className="text-gray-700 font-semibold">Total Amount:</span>
                          <span className="text-3xl font-semibold text-teal-600">
                            ${cartTotal.toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={!shippingAddress || processingOrder}
                          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-semibold text-lg hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all border-2 border-teal-600"
                        >
                          {processingOrder ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Redirecting to Stripe...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-6 h-6" />
                              Proceed to Payment
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setShowCheckout(false)}
                          disabled={processingOrder}
                          className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 font-semibold disabled:opacity-50"
                        >
                          Back to Cart
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}
