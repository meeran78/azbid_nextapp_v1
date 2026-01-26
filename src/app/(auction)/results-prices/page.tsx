'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, TrendingUp, Search, Calendar } from 'lucide-react';

const ResultsPrices = () => {
  const recentResults = [
    {
      id: 1,
      title: "Vintage Apple IIe Computer",
      category: "Electronics",
      finalPrice: "$1,250",
      estimatedValue: "$800-1,200",
      soldDate: "2025-08-20",
      bids: 24,
      status: "sold"
    },
    {
      id: 2,
      title: "1965 Ford Mustang Engine Block",
      category: "Automotive", 
      finalPrice: "$3,750",
      estimatedValue: "$3,000-4,000",
      soldDate: "2025-08-18",
      bids: 18,
      status: "sold"
    },
    {
      id: 3,
      title: "Designer Handbag Collection",
      category: "Fashion",
      finalPrice: "$890",
      estimatedValue: "$600-900",
      soldDate: "2025-08-15",
      bids: 31,
      status: "sold"
    },
    {
      id: 4,
      title: "Antique Oak Dining Set",
      category: "Furniture",
      finalPrice: "$2,100",
      estimatedValue: "$1,500-2,200",
      soldDate: "2025-08-12",
      bids: 15,
      status: "sold"
    }
  ];

  const priceCategories = [
    { name: "Electronics", avgPrice: "$645", change: "+12%" },
    { name: "Automotive", avgPrice: "$2,340", change: "+8%" },
    { name: "Fashion", avgPrice: "$425", change: "-3%" },
    { name: "Furniture", avgPrice: "$1,890", change: "+15%" },
    { name: "Collectibles", avgPrice: "$890", change: "+5%" }
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
            <BarChart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Results & Prices</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore recent auction results and market trends to make informed bidding decisions.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Price Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Category Price Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {priceCategories.map((category) => (
                <div key={category.name} className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">{category.name}</h4>
                  <p className="text-2xl font-bold text-primary">{category.avgPrice}</p>
                  <p className={`text-sm ${category.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {category.change} vs last month
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Auction Results</h2>
          
          {recentResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-6 items-center">
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                    <Badge variant="secondary" className="mt-1">{result.category}</Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Final Price</p>
                    <p className="text-xl font-bold text-primary">{result.finalPrice}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estimated</p>
                    <p className="text-sm">{result.estimatedValue}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Bids</p>
                    <p className="font-semibold">{result.bids}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(result.soldDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className="mt-1">Sold</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Understanding Auction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Price Analysis</h4>
                <p className="text-muted-foreground">Compare final selling prices with pre-sale estimates to understand market trends and item valuations.</p>
              </div>
              <div>
                <h4 className="font-semibold">Bidding Activity</h4>
                <p className="text-muted-foreground">Higher bid counts often indicate strong demand and competitive pricing for similar items.</p>
              </div>
              <div>
                <h4 className="font-semibold">Market Trends</h4>
                <p className="text-muted-foreground">Track category performance over time to identify emerging trends and investment opportunities.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPrices;