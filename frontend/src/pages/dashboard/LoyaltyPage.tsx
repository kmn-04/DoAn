import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { 
  SparklesIcon, 
  TrophyIcon, 
  GiftIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface LoyaltyStats {
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

export default function LoyaltyPage() {
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyData();
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
    } catch (error: any) {
      console.error('Error fetching loyalty data:', error);
      setError(error.response?.data?.error || 'Không thể tải dữ liệu điểm thưởng');
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loyaltyStats) return null;

  const progressPercentage = loyaltyStats.nextLevel !== 'MAX_LEVEL'
    ? Math.min(100, ((loyaltyStats.pointsBalance - (loyaltyStats.totalEarned - loyaltyStats.pointsToNextLevel - loyaltyStats.pointsBalance)) / loyaltyStats.pointsToNextLevel) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Chương Trình Điểm Thưởng
          </h1>
          <p className="text-stone-600 font-normal">
            Tích điểm từ mỗi chuyến đi và nhận ưu đãi đặc biệt
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
                <p className="text-sm opacity-75 font-medium tracking-[0.2em]" style={{ color: '#D4AF37' }}>HẠNG THÀNH VIÊN</p>
                <h2 className="text-4xl font-bold tracking-tight">{loyaltyStats.currentLevel}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75 font-medium tracking-[0.2em]" style={{ color: '#D4AF37' }}>TỔNG ĐIỂM</p>
              <p className="text-5xl font-bold tracking-tight">{loyaltyStats.pointsBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress bar */}
          {loyaltyStats.nextLevel !== 'MAX_LEVEL' ? (
            <div className="relative">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Tiến độ lên {loyaltyStats.nextLevel}</span>
                <span className="font-bold" style={{ color: '#D4AF37' }}>{loyaltyStats.pointsToNextLevel.toLocaleString()} điểm nữa</span>
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
              <p className="text-xl font-semibold" style={{ color: '#D4AF37' }}>🎉 Bạn đã đạt hạng cao nhất!</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">ĐIỂM HIỆN CÓ</p>
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
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">TỔNG TÍCH ĐƯỢC</p>
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
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">ĐÃ SỬ DỤNG</p>
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
                <p className="text-sm text-stone-600 mb-1 font-medium tracking-wide">GIẢM GIÁ</p>
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
              Quyền lợi của bạn
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 tracking-tight">Giảm giá</p>
                  <p className="text-sm text-stone-600 font-normal">
                    {(loyaltyStats.benefits.discount * 100).toFixed(0)}% mọi booking
                  </p>
                </div>
              </div>

              {loyaltyStats.benefits.priority && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">Ưu tiên</p>
                    <p className="text-sm text-stone-600 font-normal">Xử lý booking nhanh</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.freeUpgrade && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">⬆️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">Nâng cấp miễn phí</p>
                    <p className="text-sm text-stone-600 font-normal">Phòng & dịch vụ</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.personalManager && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-orange-100 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">Hỗ trợ cá nhân</p>
                    <p className="text-sm text-stone-600 font-normal">Tư vấn 24/7</p>
                  </div>
                </div>
              )}

              {loyaltyStats.benefits.vipEvents && (
                <div className="flex items-start gap-3 p-4 bg-pink-50 border border-pink-100">
                  <div className="flex-shrink-0 h-10 w-10 bg-pink-100 flex items-center justify-center">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 tracking-tight">Sự kiện VIP</p>
                    <p className="text-sm text-stone-600 font-normal">Trải nghiệm độc quyền</p>
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
                Lịch sử giao dịch
              </h3>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-16">
                <StarIcon className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600 font-semibold text-lg mb-2">Chưa có giao dịch nào</p>
                <p className="text-sm text-stone-500 font-normal">
                  Tích điểm từ booking và review để nhận ưu đãi!
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
                        {transaction.transactionType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Banner - Coming Soon */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-8 text-white text-center shadow-lg relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}></div>
          
          <div className="relative">
            <h3 className="text-2xl font-bold mb-2 tracking-tight">Đổi điểm lấy voucher</h3>
            <p className="mb-6 opacity-90 font-normal">
              Tính năng đang được phát triển. Sử dụng <span className="font-bold" style={{ color: '#D4AF37' }}>{loyaltyStats.pointsBalance.toLocaleString()} điểm</span> của bạn để nhận ưu đãi!
            </p>
            <div className="inline-block border px-8 py-3" style={{ borderColor: '#D4AF37' }}>
              <p className="font-semibold tracking-[0.2em]" style={{ color: '#D4AF37' }}>SẮP RA MẮT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
