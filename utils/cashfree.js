const { Cashfree, CFEnvironment } = require("cashfree-pg");

// Instantiate SDK with correct environment and credentials
const isProduction = process.env.NODE_ENV === "production";
const cashfree = new Cashfree(
  isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET
);

const createCashfreeOrder = async (order, user) => {
  const cfOrderId = `order_${order._id}`;

  const request = {
    order_id: cfOrderId,
    order_amount: parseFloat(order.total),
    order_currency: "INR",
    customer_details: {
      customer_id: user._id.toString(),
      customer_email: user.email,
      customer_phone: user.phone || "9999999999",
    },
    // Optional: Add this later once your domain is whitelisted
    // order_meta: {
    //   return_url: `${process.env.CLIENT_BASE_URL}/payment-success?order_id=${cfOrderId}`,
    //   notify_url: `${process.env.SERVER_BASE_URL}/api/v1/payment-webhook`,
    // },
  };

  try {
    const response = await cashfree.PGCreateOrder(request);

    console.log(response.data);
    const sessionId = response.data?.payment_session_id;

    if (!sessionId) {
      throw new Error("Payment session ID missing in response.");
    }

    const baseDomain = isProduction
      ? "https://www.cashfree.com"
      : "https://sandbox.cashfree.com";
    const paymentUrl = `${baseDomain}/pg/view/payment?payment_session_id=${sessionId}`;

    if (!isProduction) {
      console.log("✅ Cashfree SDK Order Response:", response.data);
      console.log("✅ Generated Payment URL:", paymentUrl);
    }

    return {
      ...response.data,
      paymentUrl,
      sessionId,
    };
  } catch (error) {
    console.error(
      "❌ Cashfree SDK Error:",
      error.response?.data || error.message
    );
    throw new Error("Cashfree order creation failed.");
  }
};

module.exports = { createCashfreeOrder };
