'use client';
import { Search, Gavel, Users, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const HighlightedFeature = () => {
	const navigate = useRouter();
	return (
		<section className='py-16'>
			<div className='container mx-auto px-4'>
				<div className='text-center mb-12'>
					<div className='flex items-center justify-center space-x-2 mb-4'>
						<Badge
							variant='outline'
							className='bg-primary/10 text-primary border-primary/20'>
							⭐ FEATURES LIST
						</Badge>
					</div>
					<h3 className='text-4xl font-bold mb-4'>
						Highlighted <span className='italic'>Features</span>
					</h3>
				</div>

				<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
					<div className='text-center group animate-fade-in'>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<Search className='h-8 w-8 text-primary' />
						</div>
						<h4 className='text-lg font-semibold mb-2'>
							Discover the best deals
						</h4>
						<p className='text-muted-foreground text-sm'>
							Explore thousands of unique items and find incredible deals on
							products you love.
						</p>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.1s' }}>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<Gavel className='h-8 w-8 text-primary' />
						</div>
						<h4 className='text-lg font-semibold mb-2'>Standout Auctions</h4>
						<p className='text-muted-foreground text-sm'>
							Premium auctions featuring rare and exclusive items from trusted
							sellers worldwide.
						</p>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.2s' }}>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<ShieldCheck className='h-8 w-8 text-primary' />
						</div>
						<h4 className='text-lg font-semibold mb-2'>Pay safely</h4>
						<p className='text-muted-foreground text-sm'>
							Secure transactions with buyer protection and multiple trusted
							payment methods.
						</p>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.3s' }}>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<Users className='h-8 w-8 text-primary' />
						</div>
						<h4 className='text-lg font-semibold mb-2'>We're here to help</h4>
						<p className='text-muted-foreground text-sm'>
							24/7 customer support team ready to assist you with any questions
							or concerns.
						</p>
					</div>
				</div>

				{/* How to Use Cards */}
				<div className='grid md:grid-cols-2 gap-6'>
					<Card className='overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800'>
						<CardContent className='p-8 flex items-center justify-between'>
							<div>
								<h4 className='text-xl font-bold mb-2 text-amber-800 dark:text-amber-200'>
									How to buy a product
								</h4>
								<Button
									variant='outline'
									className='border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900'
									onClick={() => navigate.push('/how-to-buy')}>
									Learn More →
								</Button>
							</div>
							<div className='text-4xl'>🛒</div>
						</CardContent>
					</Card>

					<Card className='overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-teal-50 to-cyan-100 dark:from-teal-950 dark:to-cyan-950 border-teal-200 dark:border-teal-800'>
						<CardContent className='p-8 flex items-center justify-between'>
							<div>
								<h4 className='text-xl font-bold mb-2 text-teal-800 dark:text-teal-200'>
									How to sell your product
								</h4>
								<Button
									variant='outline'
									className='border-teal-300 text-teal-800 hover:bg-teal-100 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-900'
									onClick={() => navigate.push('/how-to-sell')}>
									Learn More →
								</Button>
							</div>
							<div className='text-4xl'>💰</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default HighlightedFeature;
