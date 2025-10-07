import React, { useState } from 'react';
import { deviceSizes, useResponsive } from '../../utils/responsive';

interface ResponsiveTestToolProps {
  children: React.ReactNode;
}

export const ResponsiveTestTool: React.FC<ResponsiveTestToolProps> = ({ children }) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const responsive = useResponsive();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  const handleDeviceChange = (deviceName: string) => {
    const device = deviceSizes[deviceName as keyof typeof deviceSizes];
    if (device) {
      setSelectedDevice(deviceName);
      // Resize the window (only works in some browsers)
      try {
        window.resizeTo(device.width, device.height);
      } catch (e) {
      }
    }
  };

  const resetDevice = () => {
    setSelectedDevice(null);
    try {
      window.resizeTo(1280, 720);
    } catch (e) {
    }
  };

  return (
    <>
      {/* Floating test tool */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors"
          title="Responsive Test Tool"
        >
          📱
        </button>

        {isVisible && (
          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Responsive Test Tool</h3>
              <div className="text-sm text-gray-600 mb-2">
                Current: {responsive.width}x{responsive.height} ({responsive.breakpoint})
              </div>
              <div className="text-xs text-gray-500">
                {responsive.isMobile && '📱 Mobile'}
                {responsive.isTablet && '📟 Tablet'}
                {responsive.isDesktop && '🖥️ Desktop'}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Test Devices:</h4>
              
              {/* Mobile Devices */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mobile</div>
                {Object.entries(deviceSizes)
                  .filter(([name]) => name.includes('iPhone') || name.includes('Samsung'))
                  .map(([name, size]) => (
                    <button
                      key={name}
                      onClick={() => handleDeviceChange(name)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        selectedDevice === name
                          ? 'bg-purple-100 text-purple-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {name} ({size.width}x{size.height})
                    </button>
                  ))}
              </div>

              {/* Tablets */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tablet</div>
                {Object.entries(deviceSizes)
                  .filter(([name]) => name.includes('iPad'))
                  .map(([name, size]) => (
                    <button
                      key={name}
                      onClick={() => handleDeviceChange(name)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        selectedDevice === name
                          ? 'bg-purple-100 text-purple-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {name} ({size.width}x{size.height})
                    </button>
                  ))}
              </div>

              {/* Desktop */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Desktop</div>
                {Object.entries(deviceSizes)
                  .filter(([name]) => name.includes('Desktop') || name.includes('Ultra'))
                  .map(([name, size]) => (
                    <button
                      key={name}
                      onClick={() => handleDeviceChange(name)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        selectedDevice === name
                          ? 'bg-purple-100 text-purple-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {name} ({size.width}x{size.height})
                    </button>
                  ))}
              </div>

              <button
                onClick={resetDevice}
                className="w-full mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded transition-colors"
              >
                Reset to Default
              </button>
            </div>

            {/* Quick responsive info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Breakpoints:</div>
                <div>• Mobile: &lt; 768px</div>
                <div>• Tablet: 768px - 1023px</div>
                <div>• Desktop: ≥ 1024px</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {children}
    </>
  );
};

// Component to display responsive info in development
export const ResponsiveDebugInfo: React.FC = () => {
  const responsive = useResponsive();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded font-mono z-50">
      {responsive.width}x{responsive.height} | {responsive.breakpoint} | 
      {responsive.isMobile && ' 📱'}
      {responsive.isTablet && ' 📟'}
      {responsive.isDesktop && ' 🖥️'}
    </div>
  );
};
