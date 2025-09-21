import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Modal,
  ConfirmModal,
  showToast,
  Loading,
  PageLoading,
  Skeleton,
  CardSkeleton,
  Pagination
} from '../components/ui';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

const ComponentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const handleToastDemo = (type: string) => {
    switch (type) {
      case 'success':
        showToast.success('Thành công!', 'Thao tác đã được thực hiện thành công');
        break;
      case 'error':
        showToast.error('Có lỗi xảy ra!', 'Vui lòng thử lại sau');
        break;
      case 'warning':
        showToast.warning('Cảnh báo!', 'Hãy kiểm tra thông tin trước khi tiếp tục');
        break;
      case 'info':
        showToast.info('Thông tin', 'Đây là thông báo thông tin');
        break;
    }
  };

  const handleLoadingDemo = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    showToast.success('Hoàn thành!', 'Loading demo đã hoàn tất');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UI Components Demo
          </h1>
          <p className="text-gray-600">
            Showcase của tất cả UI components trong hệ thống
          </p>
        </div>

        <div className="space-y-12">
          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Button Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Button States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button loading={loading} onClick={handleLoadingDemo}>
                      {loading ? 'Loading...' : 'Click to Load'}
                    </Button>
                    <Button disabled>Disabled</Button>
                    <Button leftIcon={<HeartIcon className="h-4 w-4" />}>
                      With Icon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="Email"
                    type="email" 
                    placeholder="Nhập email của bạn"
                    leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                  />
                  <Input 
                    label="Password"
                    type="password" 
                    placeholder="Nhập mật khẩu"
                    showPasswordToggle
                  />
                  <Input 
                    label="Search"
                    placeholder="Tìm kiếm..."
                    leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="Success Input"
                    placeholder="Valid input"
                    success="Dữ liệu hợp lệ!"
                  />
                  <Input 
                    label="Error Input"
                    placeholder="Invalid input"
                    error="Trường này là bắt buộc"
                  />
                  <Input 
                    label="Disabled Input"
                    placeholder="Disabled"
                    disabled
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hover>
                <CardHeader>
                  <CardTitle>Tour Hạ Long</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Khám phá vẻ đẹp kỳ vĩ của vịnh Hạ Long với hành trình 3 ngày 2 đêm.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Đặt ngay</Button>
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Tour Sapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Trải nghiệm thiên nhiên hùng vĩ và văn hóa độc đáo của vùng cao Sapa.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Xem chi tiết</Button>
                </CardFooter>
              </Card>

              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Tour Phú Quốc</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Nghỉ dưỡng tại đảo ngọc Phú Quốc với những bãi biển tuyệt đẹp.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">Đặt tour</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Modals */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Modals</h2>
            <Card>
              <CardHeader>
                <CardTitle>Modal Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setIsModalOpen(true)}>
                    Open Modal
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsConfirmOpen(true)}
                  >
                    Confirm Modal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Toast */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Toast Notifications</h2>
            <Card>
              <CardHeader>
                <CardTitle>Toast Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => handleToastDemo('success')}>
                    Success Toast
                  </Button>
                  <Button onClick={() => handleToastDemo('error')}>
                    Error Toast
                  </Button>
                  <Button onClick={() => handleToastDemo('warning')}>
                    Warning Toast
                  </Button>
                  <Button onClick={() => handleToastDemo('info')}>
                    Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Loading */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Basic Loading</h4>
                    <Loading text="Đang tải..." />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Centered Loading</h4>
                    <Loading text="Đang xử lý..." center />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skeleton Loading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setShowSkeletons(!showSkeletons)}
                      variant="outline"
                    >
                      Toggle Skeletons
                    </Button>
                    {showSkeletons ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-100 rounded flex items-center px-2">
                          <span className="text-xs text-gray-600">Nội dung thực tế</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded flex items-center px-2">
                          <span className="text-xs text-gray-600">Dữ liệu đã tải</span>
                        </div>
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-600">Content loaded</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Pagination */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Pagination</h2>
            <Card>
              <CardHeader>
                <CardTitle>Pagination Example</CardTitle>
              </CardHeader>
              <CardContent>
                <Pagination
                  currentPage={currentPage}
                  totalPages={10}
                  totalItems={95}
                  itemsPerPage={10}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                  showSizeChanger={true}
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        description="Đây là một modal demo"
      >
        <div className="space-y-4">
          <p>Nội dung của modal ở đây.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Đồng ý
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          showToast.success('Đã xác nhận!', 'Thao tác đã được thực hiện');
        }}
        title="Xác nhận hành động"
        description="Bạn có chắc chắn muốn thực hiện hành động này không?"
        variant="destructive"
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
};

export default ComponentDemo;
