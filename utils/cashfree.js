const axios = require("axios");

const createCashfreeOrder = async (order, user) => {
  const cfOrderId = `order_${order._id}`;

  // Choose the correct base URL based on environment
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = isProduction
    ? "https://api.cashfree.com/pg"
    : "	https://sandbox.cashfree.com/pg";

  const payload = {
    order_id: cfOrderId,
    order_amount: parseFloat(order.total),
    order_currency: "INR",
    customer_details: {
      customer_id: user._id.toString(),
      customer_email: user.email,
      customer_phone: user.phone || "9999999999",
    },
    // order_meta: {
    //   return_url: `${process.env.CLIENT_BASE_URL}/payment-success?order_id=${cfOrderId}`,
    //   notify_url: `${process.env.SERVER_BASE_URL}/api/v1/payment-webhook`,
    // },
  };

  const config = {
    headers: {
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      "x-api-version": "2025-01-01",
      "Content-Type": "application/json",
    },
  };

  console.log("Paylaod", payload);

  try {
    const response = await axios.post(`${baseUrl}/orders`, payload, config);
    console.log("✅ Cashfree Order Response:", response.data);

    let sessionId = response.data?.payment_session_id;
    if (!sessionId) {
      throw new Error("Payment session ID missing in response.");
    }

    const paymentUrl = `${baseUrl}/view/payment?payment_session_id=${sessionId}`;

    if (!isProduction) {
      console.log("✅ Cashfree Order Response:", response.data);
      console.log("✅ Generated Payment URL:", paymentUrl);
    }

    return {
      ...response.data,
      paymentUrl,
    };
  } catch (error) {
    console.error("❌ Cashfree Error:", error.response?.data || error.message);
    throw new Error("Cashfree order creation failed.");
  }
};

module.exports = { createCashfreeOrder };
