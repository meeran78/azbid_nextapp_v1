'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using AZ-Bid, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p className="text-muted-foreground mb-2">
                  Permission is granted to temporarily use AZ-Bid for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Auction Rules</h2>
                <p className="text-muted-foreground mb-2">
                  By participating in auctions on AZ-Bid, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Place bids in good faith with the intention to purchase</li>
                  <li>Complete payment within the specified timeframe if you win an auction</li>
                  <li>Provide accurate and truthful information in all listings and communications</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
                <p className="text-muted-foreground">
                  All payments must be completed within 48 hours of auction end. Failure to complete payment may result in account suspension and negative feedback.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. User Conduct</h2>
                <p className="text-muted-foreground mb-2">
                  Users are prohibited from:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Posting false, inaccurate, misleading, defamatory, or libelous content</li>
                  <li>Engaging in any form of harassment or abusive behavior</li>
                  <li>Manipulating the bidding process through shill bidding or other fraudulent activities</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Account Termination</h2>
                <p className="text-muted-foreground">
                  We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason we deem necessary.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
                <p className="text-muted-foreground">
                  The materials on AZ-Bid are provided on an 'as is' basis. AZ-Bid makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitations</h2>
                <p className="text-muted-foreground">
                  In no event shall AZ-Bid or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AZ-Bid, even if AZ-Bid or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
                <p className="text-muted-foreground">
                  These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms and Conditions, please contact us at support@az-bid.com.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;