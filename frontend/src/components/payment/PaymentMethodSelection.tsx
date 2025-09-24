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
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loading size="md" />
          <span className="ml-2">Đang tải phương thức thanh toán...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  const enabledMethods = Object.entries(paymentMethods).filter(([_, method]) => method.enabled);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Chọn phương thức thanh toán</h3>
      
      {/* Payment Amount */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tổng thanh toán:</span>
          <span className="text-xl font-bold text-blue-600">
            {paymentService.formatAmount(amount)}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3 mb-6">
        {enabledMethods.map(([code, method]) => (
          <div
            key={code}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === code
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onMethodSelect(code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* Placeholder for payment method logo */}
                  <span className="text-xs font-bold text-gray-600">
                    {method.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {method.testMode && (
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mt-1">
                      Test Mode
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedMethod === code
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === code && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enabledMethods.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Hiện tại chưa có phương thức thanh toán nào khả dụng</p>
          <p className="text-sm text-gray-500">Vui lòng liên hệ hỗ trợ để được trợ giúp</p>
        </div>
      )}

      {/* Payment Button */}
      {selectedMethod && enabledMethods.length > 0 && (
        <Button
          onClick={onPaymentInitiate}
          disabled={disabled || !selectedMethod}
          className="w-full py-3 text-lg"
          size="lg"
        >
          {disabled ? 'Đang xử lý...' : `Thanh toán qua ${paymentMethods[selectedMethod]?.name}`}
        </Button>
      )}
    </Card>
  );
};

export default PaymentMethodSelection;
