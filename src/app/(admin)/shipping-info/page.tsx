'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Clock, Shield, MapPin, CreditCard } from 'lucide-react';

const ShippingInfo = () => {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      timeframe: "5-7 business days",
      cost: "Starting at $9.99",
      description: "Reliable ground shipping for most items",
      icon: Package
    },
    {
      name: "Express Shipping", 
      timeframe: "2-3 business days",
      cost: "Starting at $19.99",
      description: "Faster delivery for urgent items",
      icon: Truck
    },
    {
      name: "Overnight Shipping",
      timeframe: "Next business day",
      cost: "Starting at $39.99", 
      description: "Priority overnight delivery",
      icon: Clock
    },
    {
      name: "White Glove Service",
      timeframe: "Scheduled delivery",
      cost: "Quote on request",
      description: "Professional handling for fragile/large items",
      icon: Shield
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
            <Truck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Shipping Information</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about shipping your auction wins safely and securely.
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {shippingOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card key={option.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{option.name}</CardTitle>
                      <Badge variant="secondary">{option.timeframe}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{option.description}</p>
                  <p className="font-semibold text-primary">{option.cost}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Shipping Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How Shipping Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">Win Your Auction</h4>
                  <p className="text-muted-foreground">Complete payment within 3 business days of winning.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Choose Shipping Method</h4>
                  <p className="text-muted-foreground">Select your preferred shipping option during checkout.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Professional Packaging</h4>
                  <p className="text-muted-foreground">Items are carefully packaged by our fulfillment team.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</div>
                <div>
                  <h4 className="font-semibold">Track Your Package</h4>
                  <p className="text-muted-foreground">Receive tracking information via email once shipped.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Policies */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Shipping Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Continental United States (all 48 states)</li>
                <li>• Alaska and Hawaii (additional fees apply)</li>
                <li>• International shipping available for select items</li>
                <li>• PO Box delivery for small items only</li>
                <li>• Freight shipping for oversized items</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Shipping Costs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Calculated based on size, weight, and destination</li>
                <li>• Free shipping on orders over $500 (standard)</li>
                <li>• Insurance included on all shipments</li>
                <li>• Additional fees for oversized/fragile items</li>
                <li>• International duties and taxes are buyer's responsibility</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Important Shipping Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Large Item Shipping</h4>
                <p className="text-yellow-700 text-sm">Items over 150 lbs or exceeding standard dimensions require special freight shipping. Additional fees and extended delivery times apply.</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">International Shipping</h4>
                <p className="text-blue-700 text-sm">International buyers are responsible for all customs duties, taxes, and import fees. Delivery times may vary based on customs processing.</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Insurance & Protection</h4>
                <p className="text-green-700 text-sm">All shipments are fully insured. Report any damage within 48 hours of delivery for insurance claims.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingInfo;