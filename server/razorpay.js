import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (keyId && keySecret) {
  // Initialize Razorpay client only when credentials are available
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
} else {
  console.warn('Razorpay credentials not set – integration disabled.');
}

export default razorpay;

