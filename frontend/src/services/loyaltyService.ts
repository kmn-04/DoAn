import { apiClient } from './api';

export interface LoyaltyPoints {
  id: number;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
}

export interface LoyaltyStats {
  currentLevel: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  pointsToNextLevel: number;
  nextLevel: string;
  benefits: {
    level: string;
    discount: number;
    priority: boolean;
    freeUpgrade: boolean;
    personalManager: boolean;
    vipEvents: boolean;
  };
}

export interface PointTransaction {
  id: number;
  points: number;
  transactionType: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
  sourceType: 'BOOKING' | 'REVIEW' | 'REFERRAL' | 'BIRTHDAY' | 'PROMOTION' | 'ADMIN';
  sourceId?: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  expiresAt?: string;
}

export interface PointVoucher {
  id: number;
  pointsCost: number;
  voucherValue: number;
  voucherCode: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface RedemptionOption {
  pointsCost: number;
  voucherValue: number;
  name: string;
}

export interface Referral {
  id: number;
  referralCode: string;
  referredUserId?: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
}

export interface ReferralStats {
  totalCompletedReferrals: number;
  totalReferralPointsEarned: number;
  referralCode: string;
}

class LoyaltyService {
  // Get user's loyalty points
  async getLoyaltyPoints(): Promise<LoyaltyPoints> {
    const response = await apiClient.get('/loyalty/points');
    return response.data.data;
  }

  // Get detailed loyalty stats
  async getLoyaltyStats(): Promise<LoyaltyStats> {
    const response = await apiClient.get('/loyalty/stats');
    return response.data.data;
  }

  // Get point transactions (paginated)
  async getPointTransactions(page: number = 0, size: number = 10) {
    const response = await apiClient.get(`/loyalty/transactions?page=${page}&size=${size}`);
    return response.data.data;
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<PointTransaction[]> {
    const response = await apiClient.get(`/loyalty/transactions/recent?limit=${limit}`);
    return response.data.data;
  }

  // Get available redemption options
  async getRedemptionOptions(): Promise<RedemptionOption[]> {
    const response = await apiClient.get('/loyalty/redemption-options');
    const data = response.data.data || [];
    // Map backend response to frontend interface
    return data.map((item: { points?: number; pointsCost?: number; value?: number; voucherValue?: number; name?: string }) => ({
      pointsCost: item.pointsCost || item.points || 0,
      voucherValue: item.voucherValue || item.value || 0,
      name: item.name || `Voucher ${(item.voucherValue || item.value || 0).toLocaleString()} VND`
    })).filter((opt: RedemptionOption) => opt.pointsCost > 0 && opt.voucherValue > 0);
  }

  // Redeem points for voucher
  async redeemPoints(points: number, voucherValue?: number, validDays?: number): Promise<PointVoucher> {
    const response = await apiClient.post('/loyalty/redeem', {
      points,
      voucherValue,
      validDays
    });
    return response.data.data;
  }

  // Get user's vouchers
  async getUserVouchers(): Promise<PointVoucher[]> {
    const response = await apiClient.get('/loyalty/vouchers');
    return response.data.data;
  }

  // Cancel voucher
  async cancelVoucher(voucherId: number): Promise<void> {
    await apiClient.post(`/loyalty/vouchers/${voucherId}/cancel`);
  }

  // Get active vouchers only
  async getActiveVouchers(): Promise<PointVoucher[]> {
    const response = await apiClient.get('/loyalty/vouchers/active');
    return response.data.data;
  }

  // Validate voucher
  async validateVoucher(voucherCode: string, bookingAmount: number): Promise<boolean> {
    const response = await apiClient.get(`/loyalty/vouchers/validate`, {
      params: { voucherCode, bookingAmount }
    });
    return response.data.data;
  }

  // Get referral code
  async getReferralCode(): Promise<string> {
    const response = await apiClient.get('/loyalty/referrals/my-code');
    return response.data.data;
  }

  // Get referral stats
  async getReferralStats(): Promise<ReferralStats> {
    const response = await apiClient.get('/loyalty/referrals/stats');
    return response.data.data;
  }

  // Get user's referrals
  async getUserReferrals(): Promise<Referral[]> {
    const response = await apiClient.get('/loyalty/referrals');
    return response.data.data;
  }

  // Get level benefits
  async getLevelBenefits(level: string) {
    const response = await apiClient.get(`/loyalty/benefits/${level}`);
    return response.data.data;
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;

