'use client';
import React, { useEffect, useState } from 'react';
// import { DashboardLayout } from '@/components/DashboardLayout';
// import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Book, 
  FileText,
  ExternalLink
} from 'lucide-react';

export default function HelpSupport() {
 // const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (user) {
//         const { data } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('user_id', user.id)
//           .single();
//         setUserProfile(data);
//       }
//     };

//     fetchUserProfile();
//   }, [user]);

  const handleFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitContact = () => {
    // This would typically send to a support system
    console.log('Contact form submitted:', contactForm);
    setContactForm({ subject: '', message: '' });
  };

  const faqItems = [
    {
      question: "How do I place a bid on an auction?",
      answer: "To place a bid, navigate to the auction page, enter your bid amount (which must be higher than the current bid), and click the 'Place Bid' button. You'll need to be logged in and have a verified account."
    },
    {
      question: "What happens when an auction ends?",
      answer: "When an auction ends, the highest bidder wins the item. The winner will receive an email notification and can proceed to payment. The seller will also be notified to prepare the item for shipping."
    },
    {
      question: "How do I create an auction as a seller?",
      answer: "Go to your seller dashboard and click 'Create Auction'. Fill in all required details including title, description, starting bid, and end date. Upload clear photos of your item and set your reserve price if needed."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payments are processed securely through Stripe, and funds are held in escrow until the transaction is complete."
    },
    {
      question: "How do I track my bids?",
      answer: "You can view all your active and past bids in the 'My Bids' section of your buyer dashboard. This shows the current status of each auction you've bid on."
    },
    {
      question: "What if I have a dispute with a seller/buyer?",
      answer: "Contact our support team immediately through this help page or email support@testazbid.com. We'll mediate the dispute and work towards a fair resolution for both parties."
    }
  ];

  return (
    // <DashboardLayout
    //   roleType={userProfile?.user_type || 'buyer'}
    //   userName={userProfile?.full_name}
    //   userEmail={userProfile?.email}
    // >
      <div className="space-y-6">
        <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-6"
          >
            ← Back
          </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <HelpCircle className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmitContact}
                className="w-full flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@testazbid.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Book className="h-4 w-4 mr-2" />
                    User Guide
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    // </DashboardLayout>
  );
}