import React, { useState } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
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

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.enum(["general", "house_model", "lot"]),
  referenceId: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { siteData } = useSiteData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "general",
      referenceId: "",
      message: ""
    }
  });

  const subject = form.watch("subject");

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Inquiry Sent",
        description: "We have received your message and will contact you shortly.",
      });
      form.reset();
    }, 1000);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4 text-center">Contact Us</h1>
        <p className="text-muted-foreground font-light mb-12 text-center">
          Begin the conversation about your future home.
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
                      <FormLabel className="uppercase tracking-widest text-xs">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
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
                      <FormLabel className="uppercase tracking-widest text-xs">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
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
                      <FormLabel className="uppercase tracking-widest text-xs">Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} className="bg-transparent border-white/10 focus-visible:border-primary rounded-none" />
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
                      <FormLabel className="uppercase tracking-widest text-xs">Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="house_model">House Model</SelectItem>
                          <SelectItem value="lot">Specific Lot</SelectItem>
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
                      <FormLabel className="uppercase tracking-widest text-xs">Select Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder="Choose a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {siteData.houseModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
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
                      <FormLabel className="uppercase tracking-widest text-xs">Select Lot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/10 focus:border-primary rounded-none">
                            <SelectValue placeholder="Choose a lot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {siteData.lots.map(lot => (
                            <SelectItem key={lot.id} value={lot.id}>{lot.name} - {lot.location.district}</SelectItem>
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
                    <FormLabel className="uppercase tracking-widest text-xs">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How can we assist you?" 
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
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
