import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ShoppingCart, CreditCard, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { formatPersianPrice, formatPersianNumber } from '@/lib/persian-utils';
import { Card, CardContent } from '@/components/ui/card';

const purchaseSchema = z.object({
  discountCode: z.string().optional(),
  paymentMethod: z.enum(['card_to_card']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'باید قوانین را بپذیرید',
  }),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

interface PurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: {
    id: number;
    title: string;
    price: number;
    description?: string;
    totalPages: number;
  };
  onPurchase: (data: PurchaseForm & { finalAmount: number }) => Promise<boolean>;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  isValid: boolean;
}

export function PurchaseDialog({
  isOpen,
  onClose,
  fileData,
  onPurchase,
}: PurchaseDialogProps) {
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankCards, setBankCards] = useState<Array<{ cardNumber: string; accountHolderName: string; bankName: string }>>([]);
  const { toast } = useToast();

   
  React.useEffect(() => {
    const fetchBankCards = async () => {
      try {
        const response = await fetch('/api/bank-cards/public');
        if (response.ok) {
          const data = await response.json();
          setBankCards(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        setBankCards([]);
      }
    };
    
    fetchBankCards();
  }, []);

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      discountCode: '',
      paymentMethod: 'card_to_card',
      agreeToTerms: false,
    },
  });

   
  if (!fileData) {
    return null;
  }

  const originalPrice = fileData.price;
  const discountAmount = discountCode?.isValid ? calculateDiscount(originalPrice, discountCode) : 0;
  const finalAmount = originalPrice - discountAmount;

  function calculateDiscount(price: number, discount: DiscountCode): number {
    if (!discount.isValid) return 0;
    
    switch (discount.type) {
      case 'percentage':
        return Math.round(price * (discount.value / 100));
      case 'fixed':
        return Math.min(discount.value, price);
      case 'free':
        return price;
      default:
        return 0;
    }
  }

  const handleApplyDiscount = async () => {
    const code = form.getValues('discountCode');
    if (!code) {
      setDiscountCode(null);
      return;
    }

    setIsApplyingDiscount(true);
    
    try {
       
      const response = await fetch(`/api/discount-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, fileId: fileData.id }),
      });

      if (response.ok) {
        const discountData = await response.json();
        setDiscountCode({
          code,
          type: discountData.type,
          value: discountData.value,
          isValid: true,
        });
        toast({
          title: 'کد تخفیف اعمال شد',
          description: `تخفیف ${discountData.type === 'percentage' ? `${formatPersianNumber(discountData.value)}%` : formatPersianPrice(discountData.value)} اعمال گردید`,
        });
      } else {
        setDiscountCode(null);
        toast({
          title: 'کد تخفیف نامعتبر',
          description: 'کد تخفیف وارد شده صحیح نیست یا منقضی شده است',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setDiscountCode(null);
      toast({
        title: 'خطا',
        description: 'مشکلی در بررسی کد تخفیف پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handlePurchase = async (data: PurchaseForm) => {
    setIsSubmitting(true);
    
    try {
      const success = await onPurchase({
        ...data,
        finalAmount,
      });

      if (success) {
        toast({
          title: 'درخواست خرید ثبت شد',
          description: 'پس از تایید پرداخت، فایل برای شما فعال می شود',
        });
        onClose();
      } else {
        toast({
          title: 'خطا در ثبت خرید',
          description: 'مشکلی در پردازش درخواست شما پیش آمد',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در ارسال درخواست پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            خرید فایل
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            تکمیل فرآیند خرید و پرداخت فایل مورد نظر
          </DialogDescription>
        </DialogHeader>

        { }
        <Card>
          <CardContent className="p-3 sm:p-4">
            <h3 className="font-bold text-base sm:text-lg mb-2">{fileData.title}</h3>
            {fileData.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">{fileData.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>{formatPersianNumber(fileData.totalPages)} صفحه</span>
              <span>آموزش جامع</span>
              <span>پروژه های عملی</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePurchase)} className="space-y-4 sm:space-y-6">
            { }
            <FormField
              control={form.control}
              name="discountCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">کد تخفیف (اختیاری)</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <FormControl>
                      <Input
                        placeholder="کد تخفیف را وارد کنید"
                        {...field}
                        disabled={isApplyingDiscount}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !field.value}
                      className="whitespace-nowrap text-sm sm:text-base px-3 sm:px-4"
                      size="sm"
                    >
                      {isApplyingDiscount ? 'در حال بررسی...' : 'اعمال'}
                    </Button>
                  </div>
                  <FormMessage />
                  
                  {discountCode?.isValid && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>
                        کد تخفیف معتبر: {discountCode.code}
                        {discountCode.type === 'percentage' && ` (${formatPersianNumber(discountCode.value)}%)`}
                        {discountCode.type === 'fixed' && ` (${formatPersianPrice(discountCode.value)})`}
                        {discountCode.type === 'free' && ' (رایگان)'}
                      </span>
                    </div>
                  )}
                </FormItem>
              )}
            />

            { }
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>روش پرداخت</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      <div className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <RadioGroupItem value="card_to_card" id="card_to_card" />
                        <Label htmlFor="card_to_card" className="mr-3 cursor-pointer flex-1">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-persian-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                کارت به کارت
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                پرداخت آنلاین با تایید دستی (۲۴ ساعته)
                              </div>
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                  به پایان پیش نمایش رسیدید
                                </div>
                                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                                  برای مشاهده کامل فایل، خرید را تکمیل کنید
                                </div>
                              </div>
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                  اطلاعات پرداخت:
                                </div>
                                {bankCards && bankCards.length > 0 ? (
                                  bankCards.map((card, index) => (
                                    <div key={`card-${index}`} className="text-sm text-blue-700 dark:text-blue-300 mb-2 p-2 bg-white dark:bg-blue-800 rounded border">
                                      <div className="font-mono font-bold text-base">{card.cardNumber}</div>
                                      <div className="text-xs mt-1">{card.accountHolderName} - {card.bankName}</div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-blue-700 dark:text-blue-300">
                                    در حال بارگذاری اطلاعات پرداخت...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            { }
            <Card className="bg-gray-50 dark:bg-gray-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">قیمت اصلی:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPersianPrice(originalPrice)}
                  </span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      تخفیف ({discountCode?.code}):
                    </span>
                    <span className="text-red-600">
                      -{formatPersianPrice(discountAmount)}
                    </span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900 dark:text-white">مبلغ نهایی:</span>
                  <span className="text-persian-blue-600">
                    {formatPersianPrice(finalAmount)}
                  </span>
                </div>
                
                {finalAmount === 0 && (
                  <div className="text-center text-green-600 font-medium">
                     این فایل برای شما رایگان است!
                  </div>
                )}
              </CardContent>
            </Card>

            { }
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300 text-persian-blue-600 focus:ring-persian-blue-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    با <Button variant="link" className="p-0 h-auto text-sm">قوانین و مقررات خرید</Button> موافقم
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            { }
            <Button 
              type="submit" 
              className="w-full btn-premium text-lg py-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'در حال پردازش...'
              ) : finalAmount === 0 ? (
                'دریافت رایگان'
              ) : (
                `پرداخت ${formatPersianPrice(finalAmount)}`
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          پس از پرداخت، فایل در کمتر از ۲۴ ساعت فعال می شود
        </div>
      </DialogContent>
    </Dialog>
  );
}
