import Subscription from '../models/Subscription.js';

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if email already exists
    const existingSubscription = await Subscription.findOne({ email: email.toLowerCase() });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(200).json({ 
          message: 'You are already subscribed to our newsletter',
          subscription: existingSubscription
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        return res.status(200).json({ 
          message: 'Successfully resubscribed to our newsletter',
          subscription: existingSubscription
        });
      }
    }

    // Create new subscription
    const subscription = await Subscription.create({
      email: email.toLowerCase(),
      isActive: true
    });

    res.status(201).json({ 
      message: 'Successfully subscribed to our newsletter',
      subscription
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(200).json({ 
        message: 'You are already subscribed to our newsletter'
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscription = await Subscription.findOne({ email: email.toLowerCase() });

    if (!subscription) {
      return res.status(404).json({ message: 'Email not found in our subscription list' });
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: 'Successfully unsubscribed from our newsletter' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





