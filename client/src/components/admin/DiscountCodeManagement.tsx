import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { formatPersianNumber, formatPersianPrice, formatPersianDateTime } from '@/lib/persian-utils';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Percent,
  Gift,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

interface DiscountCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const discountCodeSchema = z.object({
  code: z.string().min(3, 'کد تخفیف باید حداقل ۳ کاراکتر باشد').max(20, 'کد تخفیف باید حداکثر ۲۰ کاراکتر باشد'),
  type: z.enum(['percentage', 'fixed', 'free'], { message: 'نوع تخفیف را انتخاب کنید' }),
  value: z.number().min(0, 'مقدار تخفیف نمی تواند منفی باشد'),
  maxUses: z.number().int().min(1, 'حداقل یک استفاده مجاز است').nullable().optional(),
  isActive: z.boolean(),
  expiresAt: z.string().optional().nullable(),
});

type DiscountCodeForm = z.infer<typeof discountCodeSchema>;

export function DiscountCodeManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);

  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ['/api/admin/discount-codes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/discount-codes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت کدهای تخفیف');
      return response.json();
    },
  });

  const createForm = useForm<DiscountCodeForm>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      maxUses: 1,
      isActive: true,
      expiresAt: null,
    },
  });

  const editForm = useForm<DiscountCodeForm>({
    resolver: zodResolver(discountCodeSchema),
  });

  const createCodeMutation = useMutation({
    mutationFn: async (data: DiscountCodeForm) => {
      return await apiRequest('POST', '/api/admin/discount-codes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({ title: 'کد تخفیف با موفقیت ایجاد شد' });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در ایجاد کد تخفیف', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DiscountCodeForm> }) => {
      return await apiRequest('PUT', `/api/admin/discount-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({ title: 'کد تخفیف با موفقیت به روزرسانی شد' });
      setEditDialogOpen(false);
      setSelectedCode(null);
    },
    onError: () => {
      toast({ 
        title: 'خطا در به روزرسانی', 
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/discount-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({ title: 'کد تخفیف با موفقیت حذف شد' });
    },
    onError: () => {
      toast({ 
        title: 'خطا در حذف کد تخفیف', 
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const handleEdit = (code: DiscountCode) => {
    setSelectedCode(code);
    editForm.reset({
      code: code.code,
      type: code.type,
      value: code.value,
      maxUses: code.maxUses,
      isActive: code.isActive,
      expiresAt: code.expiresAt,
    });
    setEditDialogOpen(true);
  };

  const handleCreate = (data: DiscountCodeForm) => {
    createCodeMutation.mutate(data);
  };

  const handleUpdate = (data: DiscountCodeForm) => {
    if (selectedCode) {
      updateCodeMutation.mutate({ id: selectedCode.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) {
      deleteCodeMutation.mutate(id);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'درصدی';
      case 'fixed':
        return 'مبلغ ثابت';
      case 'free':
        return 'رایگان';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed':
        return <DollarSign className="w-4 h-4" />;
      case 'free':
        return <Gift className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const filteredCodes = Array.isArray(discountCodes)
    ? discountCodes.filter((code: DiscountCode) =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      { }
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  مدیریت کدهای تخفیف
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  ایجاد و مدیریت کدهای تخفیف برای فایل ها
                </p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-create-discount" 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  کد تخفیف جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>ایجاد کد تخفیف جدید</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کد تخفیف</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-code" placeholder="مثال: SUMMER2024" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع تخفیف</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="نوع تخفیف را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">درصدی</SelectItem>
                              <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                              <SelectItem value="free">رایگان</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مقدار تخفیف</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              data-testid="input-value" 
                              type="number" 
                              placeholder="مثال: 10"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="maxUses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حداکثر تعداد استفاده</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              data-testid="input-max-uses" 
                              type="number" 
                              placeholder="مثال: 100" 
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ انقضا (اختیاری)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              data-testid="input-expires-at" 
                              type="datetime-local" 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        انصراف
                      </Button>
                      <Button 
                        type="submit" 
                        data-testid="button-submit-create" 
                        disabled={createCodeMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-pink-600"
                      >
                        {createCodeMutation.isPending ? 'در حال ایجاد...' : 'ایجاد کد تخفیف'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      { }
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              data-testid="input-search"
              placeholder="جستجوی کد تخفیف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      { }
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
              <p className="text-gray-500 mt-2">در حال بارگذاری...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">کد تخفیفی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کد</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>مقدار</TableHead>
                    <TableHead>استفاده شده</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>انقضا</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code: DiscountCode) => (
                    <TableRow key={code.id} data-testid={`row-discount-${code.id}`}>
                      <TableCell className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {code.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(code.type)}
                          {getTypeLabel(code.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {code.type === 'percentage' 
                          ? `${formatPersianNumber(code.value)}%` 
                          : code.type === 'free' 
                          ? 'رایگان' 
                          : formatPersianPrice(code.value)
                        }
                      </TableCell>
                      <TableCell>
                        {formatPersianNumber(code.usedCount)} / {code.maxUses ? formatPersianNumber(code.maxUses) : '∞'}
                      </TableCell>
                      <TableCell>
                        {code.isActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            فعال
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="w-3 h-3 ml-1" />
                            غیرفعال
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {code.expiresAt ? formatPersianDateTime(code.expiresAt) : 'نامحدود'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            data-testid={`button-edit-${code.id}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(code)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            data-testid={`button-delete-${code.id}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(code.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      { }
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش کد تخفیف</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد تخفیف</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: SUMMER2024" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع تخفیف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع تخفیف را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">درصدی</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        <SelectItem value="free">رایگان</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقدار تخفیف</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="مثال: 10" onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداکثر تعداد استفاده</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="مثال: 100" value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ انقضا (اختیاری)</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCodeMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  {updateCodeMutation.isPending ? 'در حال به روزرسانی...' : 'ذخیره تغییرات'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
