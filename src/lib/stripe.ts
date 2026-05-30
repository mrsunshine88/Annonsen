import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Mock Stripe API if key is not available
class MockStripe {
  checkout = {
    sessions: {
      create: async (params: any) => {
        console.log("💳 MOCK STRIPE: Skapar checkout session", params);
        return { url: "/dashboard" }; // Skickar tillbaka användaren till dashboarden
      }
    }
  };
  subscriptionItems = {
    createUsageRecord: async (subscriptionItemId: string, params: any) => {
      console.log(`📈 MOCK STRIPE: Rapporterar ${params.quantity} annonser för sub-item: ${subscriptionItemId}`);
      return { id: "mock_usage_record", quantity: params.quantity };
    }
  };
  customers = {
    create: async (params: any) => {
      console.log("👤 MOCK STRIPE: Skapar kund", params);
      return { id: "cus_mock123" };
    }
  };
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey) 
  : new MockStripe() as unknown as Stripe;
