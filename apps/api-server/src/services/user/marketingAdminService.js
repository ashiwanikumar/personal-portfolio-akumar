//** User **//
const MarketingAdmin = require("@models/user/marketingAdmin");

class MarketingAdminService {
  // Create an marketing admin
  static createMarketingAdmin = async (marketingAdminData) => {
    try {
      const marketingAdmin = new MarketingAdmin(marketingAdminData);
      await marketingAdmin.save();

      return marketingAdmin;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = MarketingAdminService;
