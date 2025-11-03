import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPersianPrice, formatPersianNumber, formatPersianDateTime } from '@/lib/persian-utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Image,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

interface PdfFile {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  totalPages: number;
  freePages: number;
  price: number;
  viewCount: number;
  purchaseCount: number;
  isActive: boolean;
  createdAt: string;
}

export function FileManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ['/api/admin/files', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/files?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت فایل ها');
      return response.json();
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف فایل');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/files'] });
      toast({ title: 'فایل با موفقیت حذف شد' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در حذف فایل', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const toggleFileMutation = useMutation({
    mutationFn: async ({ fileId, isActive }: { fileId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/files/${fileId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در تغییر وضعیت فایل');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/files'] });
      toast({ title: 'وضعیت فایل تغییر یافت' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در تغییر وضعیت', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

   
  const uploadFileWithProgress = async (formData: FormData) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('خطا در پردازش پاسخ سرور'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || 'خطا در آپلود فایل'));
          } catch {
            reject(new Error(`خطا در آپلود فایل (کد: ${xhr.status})`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('خطا در اتصال به سرور'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('آپلود لغو شد'));
      });
      
      xhr.withCredentials = true;
      xhr.open('POST', '/api/admin/files', true);
      xhr.send(formData);
    });
  };

  const uploadFileMutation = useMutation({
    mutationFn: uploadFileWithProgress,
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/files'] });
      setUploadDialogOpen(false);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFile(null);
      setPreviewUrl(null);
      toast({ 
        title: 'فایل با موفقیت آپلود شد',
        description: 'فایل جدید به کتابخانه اضافه شد'
      });
       
      const form = document.querySelector('form');
      if (form) form.reset();
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ 
        title: 'خطا در آپلود فایل', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const editFileMutation = useMutation({
    mutationFn: async ({ fileId, updates }: { fileId: number; updates: any }) => {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ویرایش فایل');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/files'] });
      setEditDialogOpen(false);
      setSelectedFile(null);
      toast({ title: 'فایل با موفقیت ویرایش شد' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در ویرایش فایل', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const filesList = Array.isArray(files) ? files : [];

  const filteredFiles = filesList.filter((file: PdfFile) => {
    const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && file.isActive) ||
                         (statusFilter === 'inactive' && !file.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEditFile = (file: PdfFile) => {
    setSelectedFile(file);
    setEditDialogOpen(true);
  };

  const handleDeleteFile = (fileId: number) => {
    if (confirm('آیا از حذف این فایل اطمینان دارید؟')) {
      deleteFileMutation.mutate(fileId);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'خطا',
        description: 'لطفاً فقط فایل پی دی اف انتخاب کنید',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {  
      toast({
        title: 'خطا',
        description: 'حجم فایل نباید بیشتر از ۵۰ مگابایت باشد',
        variant: 'destructive'
      });
      return;
    }

    setUploadedFile(file);
    
     
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    toast({
      title: 'فایل انتخاب شد',
      description: `${file.name} - ${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    if (!uploadedFile) {
      toast({
        title: 'خطا',
        description: 'لطفاً یک فایل پی دی اف انتخاب کنید',
        variant: 'destructive'
      });
      return;
    }

    const title = formData.get('title') as string;
    if (!title?.trim()) {
      toast({
        title: 'خطا',
        description: 'عنوان فایل الزامی است',
        variant: 'destructive'
      });
      return;
    }

     
    formData.append('file', uploadedFile);
    
    uploadFileMutation.mutate(formData);
  };

  const getFileStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
        فعال
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        غیرفعال
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      { }
      <motion.div 
        className="flex flex-col gap-4 sm:gap-6 bg-gradient-to-r from-white via-green-50 to-teal-50 dark:from-gray-900 dark:via-green-900/50 dark:to-teal-900/50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              مدیریت فایل ها
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              آپلود، ویرایش و مدیریت فایل های پی دی اف
            </p>
          </div>
        </div>
        
        <div className="flex justify-center xs:justify-start">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group text-sm"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:scale-110 transition-transform" />
                <span className="hidden xs:inline">آپلود فایل جدید</span>
                <span className="xs:hidden">آپلود</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-green-200/50 dark:border-green-700/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                آپلود فایل پی دی اف جدید
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                فایل پی دی اف خود را انتخاب کرده و اطلاعات آن را وارد کنید
              </DialogDescription>
            </DialogHeader>
            { }
            <form className="space-y-4 py-4" onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان فایل *</Label>
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="عنوان فایل پی دی اف را وارد کنید" 
                    className="bg-white/50 dark:bg-gray-800/50" 
                    required
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="توضیحات کوتاه درباره فایل" 
                    className="bg-white/50 dark:bg-gray-800/50"
                    disabled={isUploading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">قیمت (تومان)</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number" 
                      placeholder="۰" 
                      defaultValue="0"
                      className="bg-white/50 dark:bg-gray-800/50"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="freePages">صفحات رایگان</Label>
                    <Input 
                      id="freePages" 
                      name="freePages"
                      type="number" 
                      placeholder="۳" 
                      defaultValue="3"
                      className="bg-white/50 dark:bg-gray-800/50"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                { }
                <div 
                  className={`text-center py-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
                    uploadedFile 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/30'
                  } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => !isUploading && !uploadedFile && document.getElementById('file-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isUploading) return;
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileSelect(files[0]);
                    }
                  }}
                >
                  {uploadedFile ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setPreviewUrl(null);
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="gap-1"
                        >
                          <X className="w-4 h-4" />
                          حذف فایل
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        فایل پی دی اف خود را اینجا بکشید یا کلیک کنید
                      </p>
                      <Button variant="outline" type="button" className="pointer-events-none">
                        انتخاب فایل
                      </Button>
                    </>
                  )}
                  
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(file);
                      }
                    }}
                    disabled={isUploading}
                  />
                </div>

                { }
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        آپلود در حال انجام...
                      </span>
                      <span className="font-medium text-green-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      در حال آپلود فایل...
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      setUploadDialogOpen(false);
                      setUploadedFile(null);
                      setPreviewUrl(null);
                      setUploadProgress(0);
                      setIsUploading(false);
                    }}
                    disabled={isUploading}
                  >
                    انصراف
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isUploading || !uploadedFile}
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    {isUploading ? `آپلود (${uploadProgress}%)` : 'آپلود فایل'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </motion.div>

      { }
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-green-200/50 dark:border-green-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              ویرایش فایل پی دی اف
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              ویرایش اطلاعات و تنظیمات فایل پی دی اف
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">عنوان فایل</Label>
                  <Input 
                    id="edit-title" 
                    defaultValue={selectedFile.title}
                    className="bg-white/50 dark:bg-gray-800/50" 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">توضیحات</Label>
                  <Textarea 
                    id="edit-description" 
                    defaultValue={selectedFile.description}
                    className="bg-white/50 dark:bg-gray-800/50" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">قیمت (تومان)</Label>
                    <Input 
                      id="edit-price" 
                      type="number" 
                      defaultValue={selectedFile.price}
                      className="bg-white/50 dark:bg-gray-800/50" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-freePages">صفحات رایگان</Label>
                    <Input 
                      id="edit-freePages" 
                      type="number" 
                      defaultValue={selectedFile.freePages}
                      className="bg-white/50 dark:bg-gray-800/50" 
                    />
                  </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{selectedFile.fileName}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(selectedFile.fileSize)} • {formatPersianNumber(selectedFile.totalPages)} صفحه
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      if (selectedFile) {
                        const updates = {
                          title: (document.getElementById('edit-title') as HTMLInputElement)?.value || selectedFile.title,
                          description: (document.getElementById('edit-description') as HTMLTextAreaElement)?.value || selectedFile.description,
                          price: parseInt((document.getElementById('edit-price') as HTMLInputElement)?.value || selectedFile.price.toString()),
                          freePages: parseInt((document.getElementById('edit-freePages') as HTMLInputElement)?.value || selectedFile.freePages.toString()),
                        };
                        editFileMutation.mutate({ fileId: selectedFile.id, updates });
                      }
                    }}
                    disabled={editFileMutation.isPending}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    {editFileMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      { }
      <motion.div 
        className="flex flex-col xs:flex-row gap-3 sm:gap-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
          <Input
            placeholder="جستجو در فایل ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 sm:pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-green-500 dark:focus:border-green-400 text-sm h-9 sm:h-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full xs:w-auto xs:min-w-[140px] sm:w-[180px] bg-white/50 dark:bg-gray-800/50 h-9 sm:h-10 text-sm">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 ml-2 flex-shrink-0" />
            <SelectValue placeholder="وضعیت فایل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه فایل ها</SelectItem>
            <SelectItem value="active">فایل های فعال</SelectItem>
            <SelectItem value="inactive">فایل های غیرفعال</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="w-5 h-5 text-green-500" />
              لیست فایل ها ({formatPersianNumber(filteredFiles.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFiles.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  فایلی یافت نشد
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {searchQuery ? 'فایل مورد نظر پیدا نشد' : 'هیچ فایلی آپلود نشده است'}
                </p>
              </motion.div>
            ) : (
              <>
                { }
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableHead className="text-right font-semibold">فایل</TableHead>
                      <TableHead className="text-right font-semibold">قیمت</TableHead>
                      <TableHead className="text-right font-semibold">آمار</TableHead>
                      <TableHead className="text-right font-semibold">وضعیت</TableHead>
                      <TableHead className="text-right font-semibold">تاریخ</TableHead>
                      <TableHead className="text-center font-semibold">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredFiles.map((file: PdfFile, index) => (
                        <motion.tr
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {file.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {file.fileName} • {formatFileSize(file.fileSize)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-green-600 dark:text-green-400 font-semibold">
                              {formatPersianPrice(file.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPersianNumber(file.totalPages)} صفحه
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span>{formatPersianNumber(file.viewCount)} بازدید</span>
                              </div>

                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileStatusBadge(file.isActive)}
                              <Switch
                                variant="premium"
                                size="sm"
                                checked={file.isActive}
                                onCheckedChange={(checked) => 
                                  toggleFileMutation.mutate({ fileId: file.id, isActive: checked })
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPersianDateTime(new Date(file.createdAt))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFile(file)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                { }
                <div className="lg:hidden space-y-4">
                  <AnimatePresence>
                    {filteredFiles.map((file: PdfFile, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        { }
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {file.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {file.fileName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getFileStatusBadge(file.isActive)}
                          </div>
                        </div>

                        { }
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">قیمت</p>
                            <p className="font-semibold text-sm sm:text-base text-green-600 dark:text-green-400 mt-1">
                              {formatPersianPrice(file.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPersianNumber(file.totalPages)} صفحه
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">آمار</p>
                            <div className="space-y-1 mt-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Eye className="w-3 h-3 text-blue-500" />
                                <span>{formatPersianNumber(file.viewCount)} بازدید</span>
                              </div>

                            </div>
                          </div>
                        </div>

                        { }
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Switch
                              variant="premium"
                              size="sm"
                              checked={file.isActive}
                              onCheckedChange={(checked) => 
                                toggleFileMutation.mutate({ fileId: file.id, isActive: checked })
                              }
                            />
                            <span className="text-xs text-gray-500">فعال/غیرفعال</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFile(file)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}