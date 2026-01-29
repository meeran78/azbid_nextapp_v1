
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Book,
  FileText,
  ExternalLink
} from 'lucide-react';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import FaqList from '@/app/components/admin/FaqList';
import { ContactSupportForm } from "@/app/components/ContactSupportForm";

export default async function HelpSupport() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  return (

    <div className="container mx-auto p-6 max-w-6xl space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <HelpCircle className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Support */}

        <ContactSupportForm
          userEmail={session?.user?.email}
          userName={session?.user?.name}
        />

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
      <FaqList />
    </div>

  );
}