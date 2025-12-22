import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import { loyaltyService, type RedemptionOption, type PointVoucher } from '../../services/loyaltyService';
import { 
  SparklesIcon, 
  TrophyIcon, 
  GiftIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  StarIcon,
  ArrowPathIcon,
  TicketIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LoyaltyStats {
  currentLevel: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  pointsToNextLevel: number;
  nextLevel: string;
  earnedLast12Months?: number;
  benefits: {
    level: string;
    discount: number;
    priority: boolean;
    freeUpgrade: boolean;
    personalManager: boolean;
    vipEvents: boolean;
  };
}

interface PointTransaction {
  id: number;
  points: number;
  transactionType: string;
  sourceType: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface RedeemVoucherSectionProps {
  pointsBalance: number;
  onRedeemSuccess: () => void;
}

const RedeemVoucherSection: React.FC<RedeemVoucherSectionProps> = ({ pointsBalance, onRedeemSuccess }) => {
  const { i18n } = useTranslation();
  const [redemptionOptions, setRedemptionOptions] = useState<RedemptionOption[]>([]);
  const [userVouchers, setUserVouchers] = useState<PointVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [options, vouchers] = await Promise.all([
        loyaltyService.getRedemptionOptions(),
        loyaltyService.getUserVouchers()
      ]);
      // Filter out invalid options (missing required fields)
      const validOptions = (options || []).filter((opt: RedemptionOption) => 
        opt && typeof opt.pointsCost === 'number' && typeof opt.voucherValue === 'number'
      );
      setRedemptionOptions(validOptions);
      setUserVouchers(vouchers || []);
    } catch (err) {
      console.error('Error fetching redemption data:', err);
      setRedemptionOptions([]);
      setUserVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (option: RedemptionOption) => {
    if (pointsBalance < option.pointsCost) {
      alert(`Bạn không đủ điểm! Cần ${option.pointsCost.toLocaleString()} điểm, bạn có ${pointsBalance.toLocaleString()} điểm.`);
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn đổi ${option.pointsCost.toLocaleString()} điểm lấy voucher ${option.voucherValue.toLocaleString()} VND?`
    );

    if (!confirmed) return;

    try {
      setRedeeming(true);
      await loyaltyService.redeemPoints(option.pointsCost, option.voucherValue);
      alert('Đổi điểm thành công! Voucher đã được thêm vào tài khoản của bạn.');
      await fetchData();
      onRedeemSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || 'Có lỗi xảy ra khi đổi điểm';
      alert(message);
    } finally {
      setRedeeming(false);
    }
  };

  const handleCancelVoucher = async (voucherId: number) => {
    const confirmed = window.confirm('Bạn có chắc muốn hủy voucher này? Điểm sẽ được hoàn lại.');
    if (!confirmed) return;

    try {
      await loyaltyService.cancelVoucher(voucherId);
      alert('Đã hủy voucher và hoàn điểm');
      await fetchData();
      onRedeemSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const getVoucherStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Có hiệu lực
        </span>;
      case 'USED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Đã sử dụng
        </span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Hết hạn
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Redemption Options */}
      <div className="bg-white border border-stone-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
          <TicketIcon className="h-6 w-6" style={{ color: '#D4AF37' }} />
          Đổi điểm lấy voucher
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-stone-400" />
          </div>
        ) : redemptionOptions.length === 0 ? (
          <p className="text-stone-600 text-center py-4">Không có tùy chọn đổi điểm nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {redemptionOptions.map((option, index) => {
              if (!option || typeof option.pointsCost !== 'number' || typeof option.voucherValue !== 'number') {
                return null;
              }
              const canRedeem = pointsBalance >= option.pointsCost;
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-5 transition-all ${
                    canRedeem
                      ? 'border-stone-200 hover:border-slate-400 hover:shadow-md cursor-pointer'
                      : 'border-stone-200 opacity-50'
                  }`}
                  onClick={() => canRedeem && !redeeming && handleRedeem(option)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">🎁</div>
                    <div className="text-right">
                      <p className="text-sm text-stone-600">Giá trị</p>
                      <p className="text-xl font-bold text-slate-900">
                        {option.voucherValue.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-stone-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Cần</span>
                      <span className="text-lg font-semibold" style={{ color: '#D4AF37' }}>
                        {option.pointsCost.toLocaleString()} điểm
                      </span>
                    </div>
                    <button
                      disabled={!canRedeem || redeeming}
                      className={`mt-3 w-full py-2 px-4 rounded-lg font-medium transition-all ${
                        canRedeem
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {redeeming ? 'Đang xử lý...' : canRedeem ? 'Đổi ngay' : 'Không đủ điểm'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Vouchers */}
      <div className="bg-white border border-stone-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
          <GiftIcon className="h-6 w-6 text-purple-500" />
          Voucher của tôi
        </h3>

        {userVouchers.length === 0 ? (
          <div className="text-center py-16">
            <GiftIcon className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 font-semibold text-lg mb-2">Chưa có voucher nào</p>
            <p className="text-sm text-stone-500 font-normal">
              Đổi điểm để nhận voucher giảm giá
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="border border-stone-200 rounded-lg p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-mono font-bold text-lg text-slate-900">{voucher.voucherCode}</p>
                      {getVoucherStatusBadge(voucher.status)}
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {voucher.voucherValue.toLocaleString()} VND
                    </p>
                    <p className="text-sm text-stone-600">
                      Đã đổi: {voucher.pointsCost.toLocaleString()} điểm
                    </p>
                  </div>
                </div>
                <div className="border-t border-stone-200 pt-3 mt-3">
                  <div className="flex items-center justify-between text-sm text-stone-600 mb-3">
                    <span>Hết hạn:</span>
                    <span className="font-medium">{formatDate(voucher.expiresAt)}</span>
                  </div>
                  {voucher.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelVoucher(voucher.id)}
                      className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all"
                    >
                      Hủy voucher và hoàn điểm
                    </button>
                  )}
                  {voucher.status === 'USED' && voucher.usedAt && (
                    <p className="text-sm text-stone-500 text-center">
                      Đã sử dụng: {formatDate(voucher.usedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function LoyaltyPage() {
  const { t, i18n } = useTranslation();
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, transactionsRes] = await Promise.all([
        apiClient.get('/loyalty/stats'),
        apiClient.get('/loyalty/transactions/recent?limit=10')
      ]);

      setLoyaltyStats(statsRes.data.data);
      setRecentTransactions(transactionsRes.data.data);
    } catch (err: unknown) {
      console.error('Error fetching loyalty data:', err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || t('loyalty.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DIAMOND': return '💎';
      case 'PLATINUM': return '🏆';
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '⭐';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'DIAMOND': return 'from-slate-700 via-slate-800 to-slate-900';
      case 'PLATINUM': return 'from-slate-600 via-slate-700 to-slate-800';
      case 'GOLD': return 'from-slate-700 via-slate-800 to-slate-900';
      case 'SILVER': return 'from-slate-600 via-slate-700 to-slate-800';
      case 'BRONZE': return 'from-slate-700 via-slate-800 to-slate-900';
      default: return 'from-slate-700 via-slate-800 to-slate-900';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (type: string) => {
    if (type === 'EARNED') return 'text-green-600';
    if (type === 'REDEEMED' || type === 'EXPIRED') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-stone-200 w-1/4"></div>
            <div className="h-48 bg-stone-200"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-stone-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-800 mb-4 font-medium">{error}</p>
            <button
              onClick={fetchLoyaltyData}
              className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 font-medium tracking-wide"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              {t('loyalty.errors.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loyaltyStats) return null;

  // Progress toward next tier uses rolling 12M earned if available (fallback totalEarned)
  const progressNumerator = loyaltyStats.earnedLast12Months ?? loyaltyStats.totalEarned;
  const progressDenominator = progressNumerator + loyaltyStats.pointsToNextLevel;
  const progressPercentage = loyaltyStats.nextLevel !== 'MAX_LEVEL'
    ? Math.min(100, Math.max(0, (progressNumerator / (progressDenominator || 1)) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {t('loyalty.title')}
          </h1>
          <p className="text-stone-600 font-normal">
            {t('loyalty.subtitle')}
          </p>
        </div>

        {/* Level Card */}
        <div className={`bg-gradient-to-br ${getLevelColor(loyaltyStats.currentLevel)} p-8 text-white mb-8 shadow-lg relative overflow-hidden`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}></div>
          
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{getLevelIcon(loyaltyStats.currentLevel)}</span>
              <div>
                <p className="text-sm opacity-75 font-medium tracking-[0.2em]" style={{ color: '#D4AF37' }}>{t('loyalty.level.memberTier')}</p>
                <h2 className="text-4xl font-bold tracking-tight">{t(`loyalty.level.names.${loyaltyStats.currentLevel}`)}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75 font-medium tracking-[0.2em]" style={{ color: '#D4AF37' }}>{t('loyalty.level.totalPoints')}</p>
              <p className="text-5xl font-bold tracking-tight">{loyaltyStats.pointsBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress bar */}
          {loyaltyStats.nextLevel !== 'MAX_LEVEL' ? (
            <div className="relative">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>{t('loyalty.level.progressTo', { level: t(`loyalty.level.names.${loyaltyStats.nextLevel}`) })}</span>
                <span className="font-bold" style={{ color: '#D4AF37' }}>{t('loyalty.level.pointsMore', { points: loyaltyStats.pointsToNextLevel.toLocaleString() })}</span>
              </div>
              <div className="w-full bg-white/20 h-3 backdrop-blur-sm">
                <div 
                  className="h-3 transition-all duration-500 shadow-lg"
                  style={{ 
                    width: `${Math.max(5, progressPercentage)}%`,
                    background: 'linear-gradient(to right, #D4AF37, #C5A028)'
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-xl font-semibold" style={{ color: '#D4AF37' }}>{t('loyalty.level.maxLevelReached')}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">{t('loyalty.stats.currentPoints')}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {loyaltyStats.pointsBalance.toLocaleString()}
                </p>
              </div>
              <SparklesIcon className="h-12 w-12" style={{ color: '#D4AF37' }} />
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">{t('loyalty.stats.totalEarned')}</p>
                <p className="text-3xl font-bold text-green-600 tracking-tight">
                  +{loyaltyStats.totalEarned.toLocaleString()}
                </p>
              </div>
              <ArrowUpIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">{t('loyalty.stats.totalRedeemed')}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {loyaltyStats.totalRedeemed.toLocaleString()}
                </p>
              </div>
              <GiftIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">{t('loyalty.stats.discount')}</p>
                <p className="text-3xl font-bold text-blue-600 tracking-tight">
                  {(loyaltyStats.benefits.discount * 100).toFixed(0)}%
                </p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Benefits */}
          <div className="lg:col-span-1 bg-white border border-stone-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
              <TrophyIcon className="h-6 w-6" style={{ color: '#D4AF37' }} />
              {t('loyalty.benefits.title')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 tracking-tight">{t('loyalty.benefits.discount.title')}</p>
                  <p className="text-sm text-stone-600 font-normal">
                    {t('loyalty.benefits.discount.description', { percent: (loyaltyStats.benefits.discount * 100).toFixed(0) })}
                  </p>
                </div>
              </div>

              {loyaltyStats.benefits.priority && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">{t('loyalty.benefits.priority.title')}</p>
                    <p className="text-sm text-stone-600 font-normal">{t('loyalty.benefits.priority.description')}</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.freeUpgrade && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">⬆️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">{t('loyalty.benefits.freeUpgrade.title')}</p>
                    <p className="text-sm text-stone-600 font-normal">{t('loyalty.benefits.freeUpgrade.description')}</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.personalManager && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-orange-100 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">{t('loyalty.benefits.personalManager.title')}</p>
                    <p className="text-sm text-stone-600 font-normal">{t('loyalty.benefits.personalManager.description')}</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.vipEvents && (
                <div className="flex items-start gap-3 p-4 bg-pink-50 border border-pink-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-pink-100 flex items-center justify-center">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">{t('loyalty.benefits.vipEvents.title')}</p>
                    <p className="text-sm text-stone-600 font-normal">{t('loyalty.benefits.vipEvents.description')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <ClockIcon className="h-6 w-6 text-blue-500" />
                {t('loyalty.transactions.title')}
              </h3>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-16">
                <StarIcon className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600 font-semibold text-lg mb-2">{t('loyalty.transactions.empty.title')}</p>
                <p className="text-sm text-stone-500 font-normal">
                  {t('loyalty.transactions.empty.description')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-all duration-300 border border-stone-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 tracking-tight">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-stone-600 font-normal mt-1">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-lg font-bold tracking-tight ${getTransactionColor(transaction.transactionType)}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-stone-500 uppercase font-medium tracking-wider mt-1">
                        {t(`loyalty.transactions.types.${transaction.transactionType}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Redeem Voucher Section */}
        <RedeemVoucherSection 
          pointsBalance={loyaltyStats.pointsBalance}
          onRedeemSuccess={() => {
            fetchLoyaltyData();
          }}
        />
      </div>
    </div>
  );
}
