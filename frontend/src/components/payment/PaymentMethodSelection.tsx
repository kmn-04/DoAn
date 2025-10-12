import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import paymentService from '../../services/paymentService';

interface PaymentMethod {
  name: string;
  code: string;
  description: string;
  logo: string;
  enabled: boolean;
  testMode: boolean;
}

interface PaymentMethodsResponse {
  [key: string]: PaymentMethod;
}

interface PaymentMethodSelectionProps {
  selectedMethod?: string;
  onMethodSelect: (method: string) => void;
  onPaymentInitiate: () => void;
  amount: number;
  disabled?: boolean;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedMethod,
  onMethodSelect,
  onPaymentInitiate,
  amount,
  disabled = false
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const methods = await paymentService.getPaymentMethods();
        setPaymentMethods(methods);
        
        // Auto-select first enabled method
        const enabledMethods = Object.entries(methods).filter(([_, method]) => method.enabled);
        if (enabledMethods.length > 0 && !selectedMethod) {
          onMethodSelect(enabledMethods[0][0]);
        }
        
      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError('Không thể tải phương thức thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [selectedMethod, onMethodSelect]);

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 rounded-none p-6">
        <div className="flex items-center justify-center py-8">
          <Loading size="md" />
          <span className="ml-3 text-gray-600 font-normal">Đang tải phương thức thanh toán...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-stone-200 rounded-none p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4 font-normal">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const enabledMethods = Object.entries(paymentMethods).filter(([_, method]) => method.enabled);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chọn phương thức thanh toán</h3>
        <p className="text-gray-600">Vui lòng chọn phương thức thanh toán phù hợp</p>
      </div>
      
      {/* Payment Amount */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-700 font-medium">Tổng thanh toán:</span>
              <p className="text-sm text-gray-500 mt-1">Bao gồm tất cả phí dịch vụ</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                {paymentService.formatAmount(amount)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Phương thức thanh toán</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabledMethods.map(([code, method]) => (
            <Card
              key={code}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedMethod === code
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onMethodSelect(code)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedMethod === code ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg font-bold text-gray-700">
                      {method.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    {method.testMode && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-2 font-medium">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1"></span>
                        Test Mode
                      </span>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === code
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === code && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {enabledMethods.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có phương thức thanh toán</h3>
            <p className="text-gray-600 mb-4">Hiện tại chưa có phương thức thanh toán nào khả dụng</p>
            <p className="text-sm text-gray-500">Vui lòng liên hệ hỗ trợ để được trợ giúp</p>
          </div>
        </Card>
      )}

      {/* Payment Button */}
      {selectedMethod && enabledMethods.length > 0 && (
        <div className="pt-4">
          <Button
            onClick={onPaymentInitiate}
            disabled={disabled || !selectedMethod}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            size="lg"
          >
            {disabled ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              `Thanh toán qua ${paymentMethods[selectedMethod]?.name}`
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Bạn sẽ được chuyển hướng đến trang thanh toán an toàn
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
