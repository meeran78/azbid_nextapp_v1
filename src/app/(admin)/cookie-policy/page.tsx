'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, Shield, BarChart, Target } from 'lucide-react';

 const CookiePolicy = () => {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      icon: Shield,
      required: true,
      description: "Necessary for the website to function properly",
      examples: ["User authentication", "Shopping cart", "Security features"],
      retention: "Session or up to 1 year"
    },
    {
      name: "Analytics Cookies", 
      icon: BarChart,
      required: false,
      description: "Help us understand how visitors use our website",
      examples: ["Page views", "User behavior", "Site performance"],
      retention: "Up to 2 years"
    },
    {
      name: "Marketing Cookies",
      icon: Target,
      required: false,
      description: "Used to deliver relevant advertisements",
      examples: ["Ad targeting", "Campaign tracking", "Social media integration"],
      retention: "Up to 1 year"
    },
    {
      name: "Preference Cookies",
      icon: Settings,
      required: false,
      description: "Remember your settings and preferences",
      examples: ["Language preference", "Display settings", "Location data"],
      retention: "Up to 1 year"
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
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Learn about how we use cookies and similar technologies on AZ-Bid.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: August 25, 2025
          </p>
        </div>

        {/* What are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better browsing experience by remembering your preferences 
              and understanding how you use our site.
            </p>
            <p className="text-muted-foreground">
              We also use similar technologies like web beacons, pixels, and local storage to collect 
              information and improve our services.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-semibold">Types of Cookies We Use</h2>
          
          {cookieTypes.map((cookie) => {
            const IconComponent = cookie.icon;
            return (
              <Card key={cookie.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{cookie.name}</CardTitle>
                    </div>
                    <Badge variant={cookie.required ? "default" : "secondary"}>
                      {cookie.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{cookie.description}</p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Examples:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {cookie.examples.map((example, index) => (
                          <li key={index}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Retention Period:</h4>
                      <p className="text-sm text-muted-foreground">{cookie.retention}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Cookie Settings</h4>
                <p className="text-muted-foreground mb-4">
                  You can manage your cookie preferences at any time using our cookie settings panel.
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Cookie Settings
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Browser Settings</h4>
                <p className="text-muted-foreground mb-2">
                  You can also control cookies through your browser settings:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Block all cookies</li>
                  <li>• Allow only first-party cookies</li>
                  <li>• Delete existing cookies</li>
                  <li>• Set up notifications for new cookies</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
                <p className="text-yellow-700 text-sm">
                  Disabling certain cookies may affect the functionality of our website. 
                  Essential cookies cannot be disabled as they are necessary for basic site operations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We work with trusted third-party services that may also set cookies on your device:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Google Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Helps us understand website usage and improve user experience.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Payment Processors</h4>
                <p className="text-sm text-muted-foreground">
                  Secure payment processing and fraud prevention services.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Social Media</h4>
                <p className="text-sm text-muted-foreground">
                  Social media integration and sharing functionality.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Customer Support</h4>
                <p className="text-sm text-muted-foreground">
                  Live chat and customer support services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Questions About Our Cookie Policy?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@az-bid.com</p>
              <p><strong>Phone:</strong> 1-800-AZ-BIDS (292-4377)</p>
              <p><strong>Address:</strong> 123 Auction Street, New York, NY 10001</p>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                This Cookie Policy may be updated from time to time. We will notify you of any 
                significant changes by posting the updated policy on our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;