import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  // For Gmail, you'll need an App Password, not regular password
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    }
  });
};

// Send order confirmation email to customer
export const sendOrderConfirmationToCustomer = async (order, customerEmail, customerName) => {
  try {
    const transporter = createTransporter();
    
    const itemsList = order.items.map(item => {
      const productName = item.product?.name || 'Product';
      return `- ${productName} x${item.quantity} - ETB ${item.price.toLocaleString()}`;
    }).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"da-hi Marketplace" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Order Confirmation - Your Order Has Been Placed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #16A34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Order Confirmation</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>
            
            <h2 style="color: #16A34A; border-bottom: 2px solid #16A34A; padding-bottom: 10px;">Order Details</h2>
            
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Order Status:</strong> ${order.orderStatus}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            
            <h3 style="color: #1F2937; margin-top: 25px;">Order Items:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Shipping Cost:</strong> ETB ${order.shippingCost.toLocaleString()}</p>
              <p style="font-size: 1.2em; font-weight: bold; color: #16A34A; margin-top: 10px;">
                <strong>Total Amount:</strong> ETB ${order.totalAmount.toLocaleString()}
              </p>
            </div>
            
            <h3 style="color: #1F2937; margin-top: 25px;">Shipping Address:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <p>${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phone}</p>
            </div>
            
            <p style="margin-top: 30px;">We'll send you another email once your order has been shipped.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            <strong>da-hi Marketplace Team</strong></p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to customer: ${customerEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email to customer:', error);
    // Don't throw error - we don't want email failures to break order creation
  }
};

// Send order notification email to seller
export const sendOrderNotificationToSeller = async (order, sellerEmail, sellerId) => {
  try {
    const transporter = createTransporter();
    
    // Filter items that belong to this seller
    const sellerItems = order.items.filter(item => {
      const itemSellerId = item.product?.seller?._id?.toString() || item.product?.seller?.toString();
      return itemSellerId === sellerId;
    });

    if (sellerItems.length === 0) {
      // No items for this seller
      return;
    }

    const itemsList = sellerItems.map(item => {
      const productName = item.product?.name || 'Product';
      return `- ${productName} x${item.quantity} - ETB ${item.price.toLocaleString()}`;
    }).join('\n');

    // Calculate subtotal for this seller's items
    const subtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"da-hi Marketplace" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: 'New Order Received - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #16A34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">New Order Received</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p>Dear Seller,</p>
            
            <p>Great news! You have received a new order. Please process it as soon as possible.</p>
            
            <h2 style="color: #16A34A; border-bottom: 2px solid #16A34A; padding-bottom: 10px;">Order Details</h2>
            
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Customer:</strong> ${order.user?.name || 'Customer'}</p>
            <p><strong>Customer Email:</strong> ${order.user?.email || 'N/A'}</p>
            <p><strong>Order Status:</strong> ${order.orderStatus}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            
            <h3 style="color: #1F2937; margin-top: 25px;">Your Products in This Order:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
              <p style="margin-top: 15px; font-weight: bold; color: #16A34A;">
                Subtotal: ETB ${subtotal.toLocaleString()}
              </p>
            </div>
            
            <h3 style="color: #1F2937; margin-top: 25px;">Shipping Address:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <p>${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phone}</p>
            </div>
            
            <p style="margin-top: 30px;">Please log in to your dashboard to process this order.</p>
            
            <p>Best regards,<br>
            <strong>da-hi Marketplace Team</strong></p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent to seller: ${sellerEmail}`);
  } catch (error) {
    console.error('Error sending order notification email to seller:', error);
    // Don't throw error - we don't want email failures to break order creation
  }
};

