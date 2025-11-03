import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Building2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatPersianNumber } from '@/lib/persian-utils';
import 'iranianbanklogos/dist/ibl.css';

 
const IRANIAN_BANKS = {
  'saderat': {
    name: 'بانک صادرات ایران', 
    nameEn: 'Bank Saderat Iran',
    color: '#059669',
    logoClass: 'ibl-bsi',
    cardPrefixes: ['627648', '627892']
  },
  'mellat': {
    name: 'بانک ملت',
    nameEn: 'Bank Mellat',
    color: '#7c2d12', 
    logoClass: 'ibl-mellat',
    cardPrefixes: ['610433', '991975']
  },
  'tejarat': {
    name: 'بانک تجارت',
    nameEn: 'Tejarat Bank', 
    color: '#dc2626',
    logoClass: 'ibl-tejarat',
    cardPrefixes: ['627353', '585983']
  },
  'melli': {
    name: 'بانک ملی ایران',
    nameEn: 'Bank Melli Iran',
    color: '#1e40af',
    logoClass: 'ibl-bmi',
    cardPrefixes: ['627760', '627412', '622106']
  },
  'sepah': {
    name: 'بانک سپه',
    nameEn: 'Bank Sepah',
    color: '#1d4ed8',
    logoClass: 'ibl-sepah', 
    cardPrefixes: ['589210', '627648']
  },
  'keshavarzi': {
    name: 'بانک کشاورزی',
    nameEn: 'Agriculture Bank',
    color: '#16a34a',
    logoClass: 'ibl-bki',
    cardPrefixes: ['603770', '639607', '627648']
  },
  'parsian': {
    name: 'بانک پارسیان',
    nameEn: 'Parsian Bank',
    color: '#dc2626',
    logoClass: 'ibl-parsian',
    cardPrefixes: ['622106', '627884']
  },
  'maskan': {
    name: 'بانک مسکن',
    nameEn: 'Maskan Bank',
    color: '#ea580c',
    logoClass: 'ibl-maskan',
    cardPrefixes: ['628023', '627760']
  },
  'refah': {
    name: 'بانک رفاه کارگران',
    nameEn: 'Refah Bank',
    color: '#7c3aed',
    logoClass: 'ibl-rb',
    cardPrefixes: ['627381', '505785']
  },
  'eghtesad': {
    name: 'بانک اقتصاد نوین',
    nameEn: 'EN Bank',
    color: '#2563eb', 
    logoClass: 'ibl-en',
    cardPrefixes: ['627412', '622002']
  },
  'ansar': {
    name: 'بانک انصار',
    nameEn: 'Ansar Bank',
    color: '#16a34a',
    logoClass: 'ibl-ansar',
    cardPrefixes: ['627381', '505785']
  },
  'pasargad': {
    name: 'بانک پاسارگاد',
    nameEn: 'Pasargad Bank',
    color: '#059669',
    logoClass: 'ibl-bpi',
    cardPrefixes: ['639347', '502229']
  },
  'saman': {
    name: 'بانک سامان',
    nameEn: 'Saman Bank', 
    color: '#7c3aed',
    logoClass: 'ibl-sb',
    cardPrefixes: ['621986', '639607']
  },
  'sina': {
    name: 'بانک سینا',
    nameEn: 'Sina Bank',
    color: '#dc2626',
    logoClass: 'ibl-sina',
    cardPrefixes: ['639347', '505416']
  },
  'post': {
    name: 'پست بانک ایران',
    nameEn: 'Post Bank Iran',
    color: '#1e40af',
    logoClass: 'ibl-post',
    cardPrefixes: ['627760', '639607']
  },
  'ghavamin': {
    name: 'بانک قوامین',
    nameEn: 'Ghavamin Bank',
    color: '#7c2d12',
    logoClass: 'ibl-ghbi',
    cardPrefixes: ['639370', '505785']
  },
  'tosee': {
    name: 'بانک توسعه تعاون',
    nameEn: 'Tosee Taavon Bank',
    color: '#059669',
    logoClass: 'ibl-tt',
    cardPrefixes: ['627648', '502908']
  },
  'shahr': {
    name: 'بانک شهر',
    nameEn: 'Shahr Bank',
    color: '#1d4ed8',
    logoClass: 'ibl-shahr',
    cardPrefixes: ['502806', '627412']
  },
  'ayandeh': {
    name: 'بانک آینده',
    nameEn: 'Ayandeh Bank',
    color: '#059669',
    logoClass: 'ibl-ba',
    cardPrefixes: ['636214', '505785']
  },
  'sarmayeh': {
    name: 'بانک سرمایه',
    nameEn: 'Sarmayeh Bank',
    color: '#7c3aed',
    logoClass: 'ibl-sarmayeh',
    cardPrefixes: ['639607', '627381']
  },
  'dey': {
    name: 'بانک دی',
    nameEn: 'Day Bank',
    color: '#dc2626',
    logoClass: 'ibl-day',
    cardPrefixes: ['502938', '627381']
  },
  'hekmat': {
    name: 'بانک حکمت ایرانیان',
    nameEn: 'Hekmat Iranian Bank',
    color: '#16a34a',
    logoClass: 'ibl-hi',
    cardPrefixes: ['636214', '627648']
  },
  'iranzamin': {
    name: 'بانک ایران زمین',
    nameEn: 'Iran Zamin Bank',
    color: '#ea580c',
    logoClass: 'ibl-iz',
    cardPrefixes: ['505785', '627412']
  },
  'karafarin': {
    name: 'بانک کارآفرین',
    nameEn: 'Karafarin Bank',
    color: '#1e40af',
    logoClass: 'ibl-kar',
    cardPrefixes: ['627488', '502908']
  },
  'tourism': {
    name: 'بانک گردشگری',
    nameEn: 'Tourism Bank',
    color: '#7c3aed',
    logoClass: 'ibl-tourism',
    cardPrefixes: ['505416', '627760']
  },
  'sanatomadan': {
    name: 'بانک صنعت و معدن',
    nameEn: 'Industry & Mine Bank',
    color: '#059669',
    logoClass: 'ibl-bim',
    cardPrefixes: ['627412', '639607']
  },
  'tosee_saderat': {
    name: 'بانک توسعه صادرات ایران',
    nameEn: 'Export Development Bank',
    color: '#dc2626',
    logoClass: 'ibl-edbi',
    cardPrefixes: ['627648', '505785']
  },
  'sederat': {
    name: 'بانک توسعه صادرات ایران',
    nameEn: 'Export Development Bank',
    color: '#dc2626',
    logoClass: 'ibl-edbi',
    cardPrefixes: ['627648', '505785']
  },
  'middleeast': {
    name: 'بانک خاورمیانه',
    nameEn: 'Middle East Bank',
    color: '#1d4ed8',
    logoClass: 'ibl-me',
    cardPrefixes: ['585983', '627353']
  },
  'iranvenezuela': {
    name: 'بانک مشترک ایران و ونزولا',
    nameEn: 'Iran Venezuela Bank',
    color: '#059669',
    logoClass: 'ibl-ivbb',
    cardPrefixes: ['505785', '627353']
  },
  'resalat': {
    name: 'بانک قرض الحسنه رسالت',
    nameEn: 'Resalat Bank',
    color: '#16a34a',
    logoClass: 'ibl-resalat',
    cardPrefixes: ['627381', '505416']
  },
  'mehreiran': {
    name: 'بانک مهر ایران',
    nameEn: 'Mehr Iran Bank',
    color: '#ea580c',
    logoClass: 'ibl-miran',
    cardPrefixes: ['639370', '622106']
  },
  'melal': {
    name: 'بانک اعتباری ملل',
    nameEn: 'Melal Credit Bank',
    color: '#7c2d12',
    logoClass: 'ibl-melal',
    cardPrefixes: ['606256', '627760']
  }
};

interface BankCard {
  id: number;
  accountHolderName: string;
  accountHolderFamily: string;
  cardNumber: string;
  bankName: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BankCardManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);
  const [showCardNumbers, setShowCardNumbers] = useState<{[key: number]: boolean}>({});
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountHolderFamily: '',
    cardNumber: '',
    bankName: '',
    isActive: true,
    isDefault: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

   
  const { data: bankCards, isLoading } = useQuery({
    queryKey: ['/api/admin/bank-cards', debouncedSearchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/bank-cards?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت کارت های بانکی');
      return response.json();
    },
    staleTime: 30000,
    gcTime: 300000
  });

   
  const saveCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: any }) => {
      const url = id ? `/api/admin/bank-cards/${id}` : '/api/admin/bank-cards';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ذخیره کارت بانکی');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        predicate: query => query.queryKey[0] === '/api/admin/bank-cards' 
      });
      setCardDialogOpen(false);
      setSelectedCard(null);
      resetForm();
      toast({
        title: variables.id ? 'کارت بانکی به روزرسانی شد' : 'کارت بانکی جدید اضافه شد',
        description: 'تغییرات با موفقیت ذخیره شد',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در ذخیره',
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    }
  });

   
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const response = await fetch(`/api/admin/bank-cards/${cardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف کارت بانکی');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: query => query.queryKey[0] === '/api/admin/bank-cards' 
      });
      toast({
        title: 'کارت بانکی حذف شد',
        description: 'کارت بانکی با موفقیت حذف شد',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در حذف',
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    }
  });

  const cards = useMemo(() => Array.isArray(bankCards) ? bankCards : [], [bankCards]);

   
  const detectBank = useCallback((cardNumber: string) => {
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 6) return '';  
    
     
    for (const [bankCode, bankInfo] of Object.entries(IRANIAN_BANKS)) {
      if (bankInfo.cardPrefixes.some(prefix => cleanCard.startsWith(prefix))) {
        return bankCode;
      }
    }
    
    return '';  
  }, []);

   
  const formatCardNumber = useCallback((cardNumber: string, showFull: boolean = false) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (showFull) {
      return cleaned.replace(/(.{4})/g, '$1 ').trim();
    }
    return `**** **** **** ${cleaned.slice(-4)}`;
  }, []);

   
  const handleCardNumberChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    const detectedBank = detectBank(cleaned);
    
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted,
      bankName: detectedBank  
    }));
  }, [detectBank]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    saveCardMutation.mutate({
      id: selectedCard?.id,
      data: formData
    });
  }, [selectedCard, formData, saveCardMutation]);

  const resetForm = useCallback(() => {
    setFormData({
      accountHolderName: '',
      accountHolderFamily: '',
      cardNumber: '',
      bankName: '',
      isActive: true,
      isDefault: false
    });
  }, []);

  const handleEdit = useCallback((card: BankCard) => {
    setSelectedCard(card);
    setFormData({
      accountHolderName: card.accountHolderName,
      accountHolderFamily: card.accountHolderFamily,
      cardNumber: card.cardNumber,
      bankName: card.bankName,
      isActive: card.isActive,
      isDefault: card.isDefault
    });
    setCardDialogOpen(true);
  }, []);

  const handleDelete = useCallback((cardId: number) => {
    if (!confirm('آیا از حذف این کارت بانکی اطمینان دارید؟')) return;
    deleteCardMutation.mutate(cardId);
  }, [deleteCardMutation]);

  const toggleCardVisibility = useCallback((cardId: number) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);

  const getBankInfo = useCallback((bankCode: string) => {
    return IRANIAN_BANKS[bankCode as keyof typeof IRANIAN_BANKS] || {
      name: 'بانک نامشخص',
      nameEn: 'Unknown Bank',
      color: '#6b7280',
      logoClass: 'ibl-bmi',
      cardPrefixes: []
    };
  }, []);

  return (
    <div className="space-y-6">
      { }
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت کارت های بانکی</h2>
          <p className="text-gray-600 dark:text-gray-400">مدیریت اطلاعات کارت های بانکی برای دریافت پرداخت</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setSelectedCard(null);
            setCardDialogOpen(true);
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          افزودن کارت جدید
        </Button>
      </div>

      { }
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-green-200/50 dark:border-green-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="جستجو در کارت های بانکی..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت ها</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      { }
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {cards.map((card: BankCard) => {
              const bankInfo = getBankInfo(card.bankName);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                    { }
                    <div 
                      className="h-16 relative"
                      style={{ backgroundColor: bankInfo.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                      <div className="absolute top-3 right-4 flex items-center gap-3 text-white">
                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/50 shadow-lg">
                          <i className={`ibl ibl32 ${bankInfo.logoClass}`}></i>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{bankInfo.name}</div>
                          <div className="text-xs opacity-90">{bankInfo.nameEn}</div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-4 flex gap-2">
                        {card.isDefault && (
                          <Badge className="bg-yellow-500 text-yellow-50">پیش فرض</Badge>
                        )}
                        <Badge className={card.isActive ? 'bg-green-500' : 'bg-red-500'}>
                          {card.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-4">
                      { }
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">صاحب حساب</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {card.accountHolderName} {card.accountHolderFamily}
                        </div>
                      </div>

                      { }
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-gray-600 dark:text-gray-400">شماره کارت</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardVisibility(card.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showCardNumbers[card.id] ? 
                              <EyeOff className="w-3 h-3" /> : 
                              <Eye className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                        <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCardNumber(card.cardNumber, showCardNumbers[card.id])}
                        </div>
                      </div>



                      { }
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(card)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 ml-1" />
                          ویرایش
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(card.id)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      { }
      {!isLoading && cards.length === 0 && (
        <div className="text-center py-16">
          <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            هیچ کارت بانکی یافت نشد
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            برای شروع، اولین کارت بانکی خود را اضافه کنید
          </p>
          <Button 
            onClick={() => {
              resetForm();
              setSelectedCard(null);
              setCardDialogOpen(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <Plus className="w-4 h-4 ml-2" />
            افزودن کارت جدید
          </Button>
        </div>
      )}

      { }
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-green-200/50 dark:border-green-700/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {selectedCard ? 'ویرایش کارت بانکی' : 'افزودن کارت بانکی جدید'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedCard ? 'اطلاعات کارت بانکی را ویرایش کنید' : 'اطلاعات کارت بانکی جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            { }
            {formData.cardNumber && (() => {
              if (!formData.bankName) {
                return (
                  <motion.div 
                    className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      <div>
                        <div className="font-semibold text-amber-800 dark:text-amber-200">
                          بانک شناسایی نشد
                        </div>
                        <div className="text-sm text-amber-600 dark:text-amber-400">
                          شماره کارت وارد شده متعلق به بانک شناخته شده ای نیست. لطفاً شماره کارت را بررسی کنید.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
              const previewBankInfo = getBankInfo(formData.bankName);
              return (
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full max-w-sm mx-auto aspect-[1.6/1] perspective-1000">
                    <div 
                      className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${previewBankInfo.color} 0%, ${previewBankInfo.color}cc 50%, ${previewBankInfo.color}99 100%)`
                      }}
                    >
                      { }
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/20" />
                        <div className="absolute bottom-8 left-4 w-20 h-20 rounded-full border border-white/15" />
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white/5" />
                      </div>
                      
                      { }
                      <div className="absolute top-4 right-4 flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <div className="text-white font-bold text-sm mb-1">
                            {previewBankInfo.name}
                          </div>
                          <div className="text-white/80 text-xs">
                            {previewBankInfo.nameEn}
                          </div>
                        </div>
                        <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/60 shadow-2xl">
                          <i className={`ibl ibl64 ${previewBankInfo.logoClass}`}></i>
                        </div>
                      </div>
                      
                      { }
                      <div className="absolute bottom-16 right-4 left-4">
                        <div className="text-white/90 text-xs mb-2 font-medium">
                          شماره کارت
                        </div>
                        <div className="text-white font-mono text-lg tracking-widest">
                          {formatCardNumber(formData.cardNumber.replace(/\s/g, ''), true)}
                        </div>
                      </div>
                      
                      { }
                      <div className="absolute bottom-4 right-4 left-4">
                        <div className="text-white/90 text-xs mb-1 font-medium">
                          صاحب کارت
                        </div>
                        <div className="text-white font-semibold text-sm">
                          {formData.accountHolderName || formData.accountHolderFamily 
                            ? `${formData.accountHolderName} ${formData.accountHolderFamily}`.trim()
                            : 'نام صاحب کارت'
                          }
                        </div>
                      </div>
                      
                      { }
                      <div className="absolute top-12 left-4">
                        <div className="w-8 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md shadow-lg">
                          <div className="w-full h-full bg-gradient-to-tr from-yellow-300 to-yellow-100 rounded-md border border-yellow-500/30" />
                        </div>
                      </div>
                      
                      { }
                      <motion.div 
                        className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        تشخیص خودکار
                      </motion.div>
                    </div>
                  </div>
                  
                  { }
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      بانک شناسایی شد: <span className="font-semibold text-gray-900 dark:text-white">{previewBankInfo.name}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              { }
              <div>
                <Label htmlFor="accountHolderName">نام صاحب حساب</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  required
                  placeholder="نام"
                />
              </div>

              { }
              <div>
                <Label htmlFor="accountHolderFamily">نام خانوادگی صاحب حساب</Label>
                <Input
                  id="accountHolderFamily"
                  value={formData.accountHolderFamily}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolderFamily: e.target.value }))}
                  required
                  placeholder="نام خانوادگی"
                />
              </div>
            </div>

            { }
            <div>
              <Label htmlFor="cardNumber">شماره کارت</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                required
                placeholder="۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰"
                maxLength={19}
              />
            </div>



            { }
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">کارت فعال</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    کارت برای دریافت پرداخت فعال باشد
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">کارت پیش فرض</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    این کارت به عنوان کارت اصلی برای پرداخت استفاده شود
                  </p>
                </div>
                <Switch
                  variant="default"
                  size="md"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
              </div>
            </div>

            { }
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCardDialogOpen(false)}
                className="flex-1"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <CreditCard className="w-4 h-4 ml-2" />
                {selectedCard ? 'به روزرسانی کارت' : 'افزودن کارت'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}