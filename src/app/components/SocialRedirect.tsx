'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ArrowLeft } from 'lucide-react';

const SocialRedirect = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useRouter();

  const socialLinks = {
    facebook: {
      name: 'Facebook',
      url: 'https://facebook.com/azbid',
      description: 'Follow us on Facebook for auction updates, featured items, and community discussions.',
      color: 'bg-blue-600'
    },
    twitter: {
      name: 'Twitter',
      url: 'https://twitter.com/azbid',
      description: 'Get real-time auction alerts, breaking news, and quick updates on Twitter.',
      color: 'bg-sky-500'
    },
    instagram: {
      name: 'Instagram',
      url: 'https://instagram.com/azbid',
      description: 'Discover stunning auction items and behind-the-scenes content on Instagram.',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  };

  const currentPlatform = platform ? socialLinks[platform as keyof typeof socialLinks] : null;

  useEffect(() => {
    if (currentPlatform) {
      // Redirect after 3 seconds
      const timer = setTimeout(() => {
        window.open(currentPlatform.url, '_blank');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentPlatform]);

  if (!currentPlatform) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Platform Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The social media platform you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate.push('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Card className="text-center">
            <CardHeader>
              <div className={`w-20 h-20 ${currentPlatform.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <ExternalLink className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl">
                Redirecting to {currentPlatform.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg">
                {currentPlatform.description}
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm text-muted-foreground">
                  Redirecting in 3 seconds...
                </span>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(currentPlatform.url, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit {currentPlatform.name} Now
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate.push('/')}
                  className="w-full"
                >
                  Stay on AZ-Bid
                </Button>
              </div>
              
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-3">Follow Us on All Platforms</h4>
                <div className="flex justify-center space-x-4">
                  {Object.entries(socialLinks).map(([key, social]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate.push(`/social/${key}`)}
                      className={key === platform ? 'ring-2 ring-primary' : ''}
                    >
                      {social.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocialRedirect;