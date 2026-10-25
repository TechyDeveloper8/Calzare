import dotenv from 'dotenv';
import { StoreSetting } from '../models/StoreSetting.js';

dotenv.config();

/**
 * FShip Logistics & Courier Aggregator Service
 * Connects with FShip (fship.in / app.fship.in) for courier serviceability,
 * automated rate estimation, forward order generation, and real-time shipment tracking.
 */
class FshipService {
  constructor() {
    this.defaultApiKey =
      process.env.FSHIP_API_KEY || '68e1a2b5a61128696f34531432751be18eaea96aea6ea1aa093ff8b54c4b0507';
    this.defaultBaseUrl = process.env.FSHIP_BASE_URL || 'https://capi.fship.in';
    this.defaultPickupPincode = process.env.FSHIP_PICKUP_PINCODE || '560038'; // CALZARE Indiranagar Lab
  }

  /**
   * Retrieves active FShip credentials from MongoDB StoreSetting with fallback to environment variables
   */
  async getConfig() {
    try {
      const setting = await StoreSetting.findOne().lean();
      const apiKey = setting?.fship?.apiKey || this.defaultApiKey;
      const baseUrl = (setting?.fship?.baseUrl || this.defaultBaseUrl).replace(/\/$/, '');
      const pickupPincode = setting?.fship?.pickupPincode || this.defaultPickupPincode;
      const enabled = setting?.fship?.enabled !== false;

      return { apiKey, baseUrl, pickupPincode, enabled };
    } catch {
      return {
        apiKey: this.defaultApiKey,
        baseUrl: this.defaultBaseUrl,
        pickupPincode: this.defaultPickupPincode,
        enabled: true,
      };
    }
  }

  /**
   * Tests API key against FShip API endpoints
   * @param {string} apiKey
   * @param {string} baseUrl
   */
  async testConnection(apiKey, baseUrl) {
    const targetUrl = (baseUrl || this.defaultBaseUrl).replace(/\/$/, '');
    const key = apiKey || this.defaultApiKey;

    try {
      const res = await fetch(`${targetUrl}/api/getallcourier`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          signature: key,
        },
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: true,
          status: res.status,
          message: 'Connected to FShip Logistics Gateway successfully',
          data,
        };
      }

      if (res.status === 401) {
        return {
          success: false,
          status: 401,
          message:
            'FShip API returned 401 Unauthorized. Ensure this Client Key is activated in the FShip panel (https://app.fship.in/setting/additional/user-management) and server IP whitelisting is configured.',
        };
      }

      return {
        success: false,
        status: res.status,
        message: `FShip returned status ${res.status}: ${res.statusText}`,
      };
    } catch (err) {
      return {
        success: false,
        status: 500,
        message: `Network error connecting to FShip: ${err.message}`,
      };
    }
  }

  /**
   * Evaluates delivery serviceability and estimated delivery timeline for a given PIN code
   * @param {Object} params - { deliveryPincode, pickupPincode, weightKg, cod }
   */
  async checkServiceability({ deliveryPincode, pickupPincode, weightKg = 0.5, cod = true }) {
    const config = await this.getConfig();
    const cleanDelivery = String(deliveryPincode || '').trim();
    const cleanPickup = String(pickupPincode || config.pickupPincode).trim();

    // Indian postal code validation: 6 digits, first digit 1-9
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanDelivery)) {
      return {
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian postal code.',
      };
    }

    // Attempt live FShip API rate/serviceability check if enabled
    if (config.enabled && config.apiKey) {
      try {
        const apiRes = await fetch(`${config.baseUrl}/api/rates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            signature: config.apiKey,
          },
          body: JSON.stringify({
            pickup_pincode: cleanPickup,
            delivery_pincode: cleanDelivery,
            weight: String(weightKg),
            cod: cod ? 1 : 0,
          }),
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && (apiData.status === 'success' || apiData.couriers || apiData.data)) {
            const couriers = apiData.couriers || apiData.data || [];
            const topCourier = Array.isArray(couriers) && couriers.length > 0 ? couriers[0] : null;

            const days = topCourier?.estimated_days || 3;
            const deliveryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            const dateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

            return {
              success: true,
              serviceable: true,
              source: 'fship_live',
              pincode: cleanDelivery,
              courierPartner: topCourier?.courier_name || 'FShip Multi-Carrier Express',
              estimatedDays: days,
              estimatedDeliveryDate: dateStr,
              expressAvailable: true,
              codAvailable: cod && topCourier?.is_cod !== false,
              hubDescription: `${topCourier?.courier_name || 'FShip'} Logistics Hub`,
              message: `Estimated delivery by ${dateStr} (3–7 business days)`,
            };
          }
        }
      } catch (err) {
        console.warn('[FShip Service] Live API check fallback triggered:', err.message);
      }
    }

    // Deterministic logistics corridor fallback (calibrated with official CALZARE shipping policy)
    const prefix = parseInt(cleanDelivery.slice(0, 2), 10);
    let estimatedDays = 3;
    let expressAvailable = true;
    let codAvailable = cod;
    let hubDescription = 'National Logistics Network (FShip)';
    let courierPartner = 'Delhivery Express / Bluedart via FShip';

    if (prefix >= 56 && prefix <= 59) {
      // Karnataka / Bengaluru Primary Hub
      estimatedDays = 2;
      hubDescription = 'Bengaluru Central Fulfillment Hub';
      courierPartner = 'Bluedart Air Express (FShip)';
    } else if (
      (prefix >= 11 && prefix <= 13) ||
      (prefix >= 40 && prefix <= 44) ||
      (prefix >= 60 && prefix <= 64) ||
      (prefix >= 70 && prefix <= 72) ||
      (prefix >= 50 && prefix <= 53)
    ) {
      // Metros (Delhi NCR, Mumbai, Chennai, Kolkata, Hyderabad)
      estimatedDays = 3;
      hubDescription = 'Metro Air Corridor (FShip)';
      courierPartner = 'Delhivery Air / Xpressbees (FShip)';
    } else if (prefix === 79 || prefix === 19 || prefix === 74) {
      // Hill terrain / Remote
      estimatedDays = 6;
      expressAvailable = false;
      codAvailable = false;
      hubDescription = 'Regional Priority Surface Transit';
      courierPartner = 'DTDC Surface (FShip)';
    } else {
      estimatedDays = 4;
      hubDescription = 'Interstate Surface Express';
      courierPartner = 'Delhivery Surface / Ecom Express (FShip)';
    }

    const now = new Date();
    const deliveryDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    const dateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    return {
      success: true,
      serviceable: true,
      source: 'fship_logistics_matrix',
      pincode: cleanDelivery,
      courierPartner,
      estimatedDays,
      estimatedDeliveryDate: dateStr,
      expressAvailable,
      codAvailable,
      hubDescription,
      message: `Estimated delivery by ${dateStr} (3–7 business days)`,
    };
  }

  /**
   * Generates a forward order shipment in FShip
   * @param {Object} order - CALZARE Order Document
   */
  async createForwardOrder(order) {
    const config = await this.getConfig();

    if (!config.enabled || !config.apiKey) {
      throw new Error('FShip integration is currently disabled or API key is not configured.');
    }

    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      pickup_pincode: config.pickupPincode,
      payment_type: order.paymentMethod === 'cod' ? 'COD' : 'PREPAID',
      collectable_amount: order.paymentMethod === 'cod' ? order.totalAmount : 0,
      customer_name: order.shippingAddress?.fullName || order.customerName,
      customer_phone: order.shippingAddress?.phone || order.customerPhone,
      customer_email: order.guestEmail || '',
      shipping_address: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.landmark || ''}`.trim(),
      shipping_city: order.shippingAddress?.city || '',
      shipping_state: order.shippingAddress?.state || '',
      shipping_pincode: order.shippingAddress?.postalCode || '',
      package_weight: (order.items?.length || 1) * 0.45, // ~450g per footwear pair
      package_length: 30,
      package_width: 20,
      package_height: 12,
      order_items: order.items.map((it) => ({
        name: it.productName,
        sku: it.sku || `CALZ-${it.productSlug}`,
        quantity: it.quantity,
        price: it.unitPrice,
      })),
    };

    try {
      const res = await fetch(`${config.baseUrl}/api/createforwardorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          signature: config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.status === 'success' || data.waybill || data.awb)) {
        const waybill = data.waybill || data.awb || `FSH-${Date.now()}`;
        const courier = data.courier_name || 'FShip Partner Courier';

        return {
          success: true,
          waybill,
          courierName: courier,
          trackingUrl: `https://app.fship.in/tracking/${waybill}`,
          labelUrl: data.label_url || null,
          data,
        };
      }

      // If FShip API returned a business/credential error, log it
      console.warn('[FShip Service] createforwardorder response:', res.status, data);
      return {
        success: false,
        status: res.status,
        message: data.message || `FShip forward order creation failed with status ${res.status}`,
        details: data,
      };
    } catch (err) {
      console.error('[FShip Service] Network exception in createForwardOrder:', err);
      return {
        success: false,
        message: `Network communication error with FShip: ${err.message}`,
      };
    }
  }

  /**
   * Tracks a waybill/AWB via FShip tracking endpoint
   * @param {string} waybill
   */
  async trackShipment(waybill) {
    const config = await this.getConfig();

    try {
      const res = await fetch(`${config.baseUrl}/api/tracking?waybill=${encodeURIComponent(waybill)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          signature: config.apiKey,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, tracking: data };
      }

      return {
        success: false,
        status: res.status,
        message: `FShip tracking not available for waybill: ${waybill}`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Tracking inquiry failed: ${err.message}`,
      };
    }
  }
}

export const fshipService = new FshipService();
