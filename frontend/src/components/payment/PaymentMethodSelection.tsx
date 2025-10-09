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
    <div>
      <h3 className="text-lg font-normal text-slate-900 mb-6 tracking-tight">Chọn phương thức thanh toán</h3>
      
      {/* Payment Amount */}
      <div className="bg-stone-50 border border-stone-200 p-5 rounded-none mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-normal">Tổng thanh toán:</span>
          <span className="text-2xl font-normal tracking-tight" style={{ color: '#D4AF37' }}>
            {paymentService.formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-8">
        {enabledMethods.map(([code, method]) => (
          <div
            key={code}
            className={`border-2 rounded-none p-5 cursor-pointer transition-all ${
              selectedMethod === code
                ? 'border-slate-700 bg-amber-50'
                : 'border-stone-200 hover:border-stone-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onMethodSelect(code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-900 rounded-none flex items-center justify-center">
                  {/* Placeholder for payment method logo */}
                  <span className="text-sm font-bold text-white tracking-wider">
                    {method.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 tracking-tight">{method.name}</h4>
                  <p className="text-sm text-gray-600 font-normal mt-1">{method.description}</p>
                  {method.testMode && (
                    <span className="inline-block px-2 py-1 text-xs bg-amber-100 border border-amber-300 text-amber-800 rounded-none mt-2 font-medium">
                      Test Mode
                    </span>
                  )}
                </div>
              </div>
              
              <div 
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedMethod === code
                    ? 'border-transparent'
                    : 'border-stone-300'
                }`}
                style={selectedMethod === code ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
              >
                {selectedMethod === code && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enabledMethods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2 font-normal">Hiện tại chưa có phương thức thanh toán nào khả dụng</p>
          <p className="text-sm text-gray-500 font-normal">Vui lòng liên hệ hỗ trợ để được trợ giúp</p>
        </div>
      )}

      {/* Payment Button */}
      {selectedMethod && enabledMethods.length > 0 && (
        <Button
          onClick={onPaymentInitiate}
          disabled={disabled || !selectedMethod}
          className="w-full py-4 text-lg text-white rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
          size="lg"
        >
          {disabled ? 'Đang xử lý...' : `Thanh toán qua ${paymentMethods[selectedMethod]?.name}`}
        </Button>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
