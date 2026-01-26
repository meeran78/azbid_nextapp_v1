'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Clock, ShieldCheck, AlertTriangle, FileText, Mail } from 'lucide-react';

const ReturnsPolicy = () => {
  const returnReasons = [
    {
      reason: "Item Not as Described",
      eligible: true,
      timeframe: "7 days",
      description: "Item significantly differs from auction listing"
    },
    {
      reason: "Damaged in Shipping",
      eligible: true,
      timeframe: "48 hours",
      description: "Item damaged during transit (with documentation)"
    },
    {
      reason: "Authentication Issues",
      eligible: true,
      timeframe: "14 days",
      description: "Item fails third-party authentication (where applicable)"
    },
    {
      reason: "Buyer's Remorse",
      eligible: false,
      timeframe: "N/A",
      description: "Change of mind after purchase"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-6"
          >
            ← Back
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <RotateCcw className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Returns Policy</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Understand our return policy to ensure a confident bidding experience.
          </p>
        </div>

        {/* Return Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Return Eligibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {returnReasons.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{item.reason}</h4>
                      <Badge variant={item.eligible ? "default" : "destructive"}>
                        {item.eligible ? "Eligible" : "Not Eligible"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                  {item.eligible && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{item.timeframe}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">Contact Support</h4>
                  <p className="text-muted-foreground">Email returns@az-bid.com within the eligible timeframe with your order number and reason for return.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Provide Documentation</h4>
                  <p className="text-muted-foreground">Include photos, videos, or third-party authentication reports as supporting evidence.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Receive Authorization</h4>
                  <p className="text-muted-foreground">Wait for return authorization and shipping instructions from our team.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</div>
                <div>
                  <h4 className="font-semibold">Ship Item Back</h4>
                  <p className="text-muted-foreground">Carefully package and ship the item using provided return label.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">5</div>
                <div>
                  <h4 className="font-semibold">Receive Refund</h4>
                  <p className="text-muted-foreground">Refund processed within 5-7 business days after we receive and inspect the item.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Terms */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Return Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Items must be in original condition</li>
                <li>• All original packaging and accessories included</li>
                <li>• No signs of use or damage by buyer</li>
                <li>• Certificate of authenticity (if provided) must be returned</li>
                <li>• Return shipping costs paid by buyer unless item defective</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Returns Department</h4>
                  <p className="text-muted-foreground">returns@az-bid.com</p>
                </div>
                <div>
                  <h4 className="font-semibold">Phone Support</h4>
                  <p className="text-muted-foreground">1-800-AZ-BIDS (292-4377)</p>
                </div>
                <div>
                  <h4 className="font-semibold">Hours</h4>
                  <p className="text-muted-foreground">Monday-Friday 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Important Exceptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800">Non-Returnable Items</h4>
                <ul className="text-red-700 text-sm mt-2 space-y-1">
                  <li>• Custom or personalized items</li>
                  <li>• Perishable goods or items with expiration dates</li>
                  <li>• Digital downloads or software</li>
                  <li>• Items sold "as-is" or "for parts"</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Restocking Fees</h4>
                <p className="text-yellow-700 text-sm">A 15% restocking fee may apply to returns of high-value items ($1,000+) or items requiring special handling.</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">International Returns</h4>
                <p className="text-blue-700 text-sm">International buyers are responsible for return shipping costs and any customs fees. Processing may take additional time.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnsPolicy;