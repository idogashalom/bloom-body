import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ordersApi } from '../services/api';
import './PaymentSelection.css';

const deliveryStates = {
  Lagos: ['Lekki', 'Victoria Island', 'Ikeja', 'Ajah', 'Surulere', 'Yaba', 'Other'],
  Abuja: ['Wuse', 'Garki', 'Maitama', 'Asokoro', 'Gwarinpa', 'Other'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Other'],
  Oyo: ['Ibadan', 'Ogbomosho', 'Oyo Town', 'Other'],
  Ogun: ['Abeokuta', 'Sango Ota', 'Ijebu Ode', 'Other'],
  Other: ['Other'],
};

const emptyDeliveryAddress = {
  fullName: '',
  phone: '',
  state: '',
  area: '',
  customArea: '',
  address: '',
  note: '',
  savePreference: 'temporary',
};

const readSavedAddress = (user) => {
  try {
    const key = user?.email || user?.id || 'guest';
    const saved = localStorage.getItem(`bloomDeliveryAddress:${key}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// This creates a React functional component called PaymentSelection
// This component is a React component that allows users to select a payment method for their Bloom Body order
const PaymentSelection = () => {
  const navigate = useNavigate();
  const { cart, clearCart, currentUser } = useShop();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const savedAddress = useMemo(() => readSavedAddress(currentUser), [currentUser]);
  const [deliveryAddress, setDeliveryAddress] = useState(() => ({
    ...emptyDeliveryAddress,
    fullName: savedAddress?.fullName || currentUser?.name || '',
    ...savedAddress,
    savePreference: savedAddress ? 'permanent' : 'temporary',
  }));
// This function handles the selection of a payment method
  const handleMethodSelect = (method) => {
    // Updates the selectedMethod state with the chosen method
    setSelectedMethod(method);
  };

  const availableAreas = deliveryStates[deliveryAddress.state] || [];

  const updateDeliveryAddress = (field, value) => {
    setDeliveryAddress((current) => ({
      ...current,
      [field]: value,
      ...(field === 'state' ? { area: '', customArea: '' } : {}),
      ...(field === 'area' && value !== 'Other' ? { customArea: '' } : {}),
    }));
  };

  const buildShippingAddress = () => {
    const selectedArea = deliveryAddress.area === 'Other'
      ? deliveryAddress.customArea
      : deliveryAddress.area;

    return [
      `Full Name: ${deliveryAddress.fullName}`,
      `Phone: ${deliveryAddress.phone}`,
      `State: ${deliveryAddress.state}`,
      `City/Area: ${selectedArea}`,
      `Address: ${deliveryAddress.address}`,
      deliveryAddress.note ? `Delivery Note: ${deliveryAddress.note}` : '',
    ].filter(Boolean).join('\n');
  };

  const validateDeliveryAddress = () => {
    const selectedArea = deliveryAddress.area === 'Other'
      ? deliveryAddress.customArea.trim()
      : deliveryAddress.area.trim();

    if (!deliveryAddress.fullName.trim()) return 'Please enter your full name.';
    if (!deliveryAddress.phone.trim()) return 'Please enter your phone number.';
    if (!deliveryAddress.state) return 'Please select your delivery state.';
    if (!selectedArea) return 'Please select or enter your delivery area.';
    if (!deliveryAddress.address.trim()) return 'Please enter your full delivery address.';

    return '';
  };

// This function handles the card payment
  const createBackendOrder = async () => {
    if (cart.length === 0) {
      navigate('/track-order');
      return;
    }

    const validationError = validateDeliveryAddress();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const storageKey = `bloomDeliveryAddress:${currentUser?.email || currentUser?.id || 'guest'}`;
      if (deliveryAddress.savePreference === 'permanent') {
        localStorage.setItem(storageKey, JSON.stringify(deliveryAddress));
      } else {
        localStorage.removeItem(storageKey);
      }

      const order = await ordersApi.createOrder({
        shipping_address: buildShippingAddress(),
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });
      localStorage.setItem('bloomLastOrderNumber', order.order_number);
      clearCart();
      navigate(`/track-order?order=${encodeURIComponent(order.order_number)}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = () => {
    createBackendOrder();
  };

// This function handles the bank transfer
  const handleBankTransfer = () => {
    createBackendOrder();
  };

  // This function handles the copying of the account number to the clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText('0123456789');
    alert('Account number copied to clipboard!');
  };

  return (
    <main className="payment-page">
      <header className="payment-header">
        <h1>Payment Selection</h1>
        <hr />
        <p className="payment-subtitle">Choose how you want to pay for your Bloom Body order</p>
      </header>

      <section className="delivery-section">
        <div className="delivery-heading">
          <h2>Delivery Address</h2>
          <p>Tell us where your Bloom Body order should be delivered.</p>
        </div>

        <div className="delivery-grid">
          <label className="delivery-field">
            <span>Full Name</span>
            <input
              type="text"
              value={deliveryAddress.fullName}
              onChange={(event) => updateDeliveryAddress('fullName', event.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label className="delivery-field">
            <span>Phone Number</span>
            <input
              type="tel"
              value={deliveryAddress.phone}
              onChange={(event) => updateDeliveryAddress('phone', event.target.value)}
              placeholder="Phone number"
            />
          </label>

          <label className="delivery-field">
            <span>State / Location</span>
            <select
              value={deliveryAddress.state}
              onChange={(event) => updateDeliveryAddress('state', event.target.value)}
            >
              <option value="">Select state</option>
              {Object.keys(deliveryStates).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label className="delivery-field">
            <span>City / Area</span>
            <select
              value={deliveryAddress.area}
              onChange={(event) => updateDeliveryAddress('area', event.target.value)}
              disabled={!deliveryAddress.state}
            >
              <option value="">Select area</option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          {deliveryAddress.area === 'Other' && (
            <label className="delivery-field delivery-field-wide">
              <span>Enter Area</span>
              <input
                type="text"
                value={deliveryAddress.customArea}
                onChange={(event) => updateDeliveryAddress('customArea', event.target.value)}
                placeholder="Enter your city or delivery area"
              />
            </label>
          )}

          <label className="delivery-field delivery-field-wide">
            <span>Full Delivery Address</span>
            <textarea
              value={deliveryAddress.address}
              onChange={(event) => updateDeliveryAddress('address', event.target.value)}
              placeholder="Street, house number, landmark"
            />
          </label>

          <label className="delivery-field delivery-field-wide">
            <span>Delivery Note (Optional)</span>
            <textarea
              value={deliveryAddress.note}
              onChange={(event) => updateDeliveryAddress('note', event.target.value)}
              placeholder="Any extra note for delivery"
            />
          </label>
        </div>

        <div className="address-save-options">
          <label>
            <input
              type="radio"
              name="save-address"
              value="permanent"
              checked={deliveryAddress.savePreference === 'permanent'}
              onChange={(event) => updateDeliveryAddress('savePreference', event.target.value)}
            />
            Save this address as permanent
          </label>
          <label>
            <input
              type="radio"
              name="save-address"
              value="temporary"
              checked={deliveryAddress.savePreference === 'temporary'}
              onChange={(event) => updateDeliveryAddress('savePreference', event.target.value)}
            />
            Enter address every time
          </label>
        </div>
      </section>

      <div className="payment-options">
        <div 
          className={`payment-option ${selectedMethod === 'card' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('card')}
        >
         
          <div className="payment-info">
            <h2>Pay with Card</h2>
            <p>Fast, secure online payment</p>
          </div>
        </div>

        <div 
          className={`payment-option ${selectedMethod === 'bank' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('bank')}
        >
         
          <div className="payment-info">
            <h2>Bank Transfer</h2>
            <p>Transfer directly to our account</p>
          </div>
        </div>
      </div>

      <div className="payment-details-container">
        {selectedMethod === 'card' && (
          <div className="payment-details card-details">
            <button className="confirm-payment-btn" onClick={handleCardPayment} disabled={submitting}>
              {submitting ? 'Processing...' : 'Pay with Card'}
            </button>
          </div>
        )}

        {selectedMethod === 'bank' && (
          <div className="payment-details bank-details">
            <div className="bank-info-card">
              <div className="bank-info-row">
                <span className="bank-label">Bank Name:</span>
                <span className="bank-value">Bloom Bank</span>
              </div>
              <div className="bank-info-row">
                <span className="bank-label">Account Name:</span>
                <span className="bank-value">Bloom Body Beauty</span>
              </div>
              <div className="bank-info-row">
                <span className="bank-label">Account Number:</span>
                <span className="bank-value account-number">0123456789</span>
                <button className="copy-btn" onClick={copyToClipboard} title="Copy Account Number">
                  <i className='fa fa-copy'/> Copy
                </button>
              </div>
            </div>
            
            <div className="upload-proof-section">
              <label htmlFor="payment-proof">Upload Payment Proof:</label>
              <input type="file" id="payment-proof" className="file-input" accept="image/*,application/pdf" />
            </div>

            <button className="confirm-payment-btn" onClick={handleBankTransfer} disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default PaymentSelection;
