import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/admin-i18n';
import { getContactView } from '@/services/contact.service';
import { useAdminStore } from '@/lib/admin-store';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useHeadTags } from '@/lib/seo';

/**
 * Public Contact page. Intro copy comes from `contactContent.json` (via
 * `contact.service.ts`); every form label, placeholder, validation message,
 * subject/option label and toast comes from the shared chrome translations
 * (`t("chrome.*")`). Model/lot reference dropdowns are derived from the shared
 * catalog + lots content by the service. Submitting persists the inquiry through
 * the content store's `addContactMessage` (localStorage triage inbox) — there is
 * no fake `setTimeout`. Visual structure, classes and animations are unchanged.
 *
 * Subject-enum bridge: the form value is `house_model`, but the chrome subject
 * dictionary key is `model`; the resolver maps `house_model → model` for labels.
 */
export default function Contact() {
  const { language } = useLanguage();
  const { t } = useT();
  useHeadTags('/contact', language);
  const view = getContactView(language);
  const addContactMessage = useAdminStore((s) => s.addContactMessage);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = z.object({
    name: z.string().min(2, t('chrome.validation.nameRequired')),
    email: z.string().email(t('chrome.validation.email')),
    phone: z.string().optional(),
    subject: z.enum(['general', 'house_model', 'lot']),
    referenceId: z.string().optional(),
    message: z.string().min(10, t('chrome.validation.messageMin')),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      referenceId: '',
      message: '',
    },
  });

  const subject = form.watch('subject');

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Subject-enum bridge: the chrome dictionary uses `model`, the form uses
    // `house_model`. Persist the chrome-aligned token so the inbox reads cleanly.
    const subjectToken = data.subject === 'house_model' ? 'model' : data.subject;
    addContactMessage({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: subjectToken,
      referenceId: data.referenceId || undefined,
      message: data.message,
    });
    setIsSubmitting(false);
    toast({
      title: t('chrome.contact.successTitle'),
      description: t('chrome.contact.successMessage'),
    });
    form.reset();
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4 text-center">{view.intro.title}</h1>
        <p className="text-muted-foreground font-light mb-12 text-center">
          {view.intro.subtitle}
        </p>

        <div className="bg-card border border-white/5 p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('chrome.form.namePlaceholder')} {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('chrome.form.emailPlaceholder')} {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.phoneOptional')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('chrome.form.phonePlaceholder')} {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.subject')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder={t('chrome.form.subjectPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">{t('chrome.subjects.general')}</SelectItem>
                          <SelectItem value="house_model">{t('chrome.subjects.model')}</SelectItem>
                          <SelectItem value="lot">{t('chrome.subjects.lot')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {subject === 'house_model' && (
                <FormField
                  control={form.control}
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.selectModel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder={t('chrome.form.chooseModelPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {view.modelOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {subject === 'lot' && (
                <FormField
                  control={form.control}
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.selectLot')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder={t('chrome.form.chooseLotPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {view.lotOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest text-xs">{t('chrome.form.message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('chrome.form.messagePlaceholder')}
                        className="min-h-[150px] bg-transparent border-white/10 focus-visible:border-primary rounded-none resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 uppercase tracking-widest"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('chrome.actions.sending') : t('chrome.actions.sendInquiry')}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
