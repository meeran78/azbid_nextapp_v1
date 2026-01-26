'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Gavel } from 'lucide-react';

const AuctionCalendar = () => {
  const upcomingAuctions = [
    {
      id: 1,
      title: "Vintage Electronics & Gaming",
      date: "2025-08-28",
      time: "2:00 PM EST",
      location: "Online",
      category: "Electronics",
      estimatedItems: 150,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Classic Car Parts Auction",
      date: "2025-08-30",
      time: "10:00 AM EST", 
      location: "Phoenix, AZ",
      category: "Automotive",
      estimatedItems: 89,
      status: "upcoming"
    },
    {
      id: 3,
      title: "Designer Fashion & Accessories",
      date: "2025-09-02",
      time: "3:00 PM EST",
      location: "Online",
      category: "Fashion",
      estimatedItems: 200,
      status: "upcoming"
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
            ← Back to home
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Auction Calendar</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Stay up to date with all upcoming auctions and never miss a bidding opportunity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingAuctions.map((auction) => (
            <Card key={auction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{auction.title}</CardTitle>
                  <Badge variant="secondary">{auction.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(auction.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{auction.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{auction.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Gavel className="h-4 w-4 text-primary" />
                    <span>{auction.estimatedItems} estimated items</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <Button className="w-full">View Details</Button>
                  <Button variant="outline" className="w-full">Set Reminder</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use the Auction Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">Browse Upcoming Auctions</h4>
                  <p className="text-muted-foreground">View all scheduled auctions with dates, times, and categories.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Set Reminders</h4>
                  <p className="text-muted-foreground">Get notified before auctions start so you never miss out.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Plan Your Bidding</h4>
                  <p className="text-muted-foreground">Review auction details and prepare your bidding strategy in advance.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuctionCalendar;