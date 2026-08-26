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
						Highlighted <span className='text-gradient-primary italic'>Features</span>
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
					<Card
						className='overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-fade-in'
						style={{ animationDelay: '0.4s' }}>
						<CardContent className='p-8 flex items-center justify-between'>
							<div>
								<h4 className='text-xl font-bold mb-2 text-primary'>
									How to buy a product
								</h4>
								<Button
									variant='outline'
									className='border-primary/30 text-primary hover:bg-primary/10'
									onClick={() => navigate.push('/how-to-buy')}>
									Learn More →
								</Button>
							</div>
							<div className='text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6'>
								🛒
							</div>
						</CardContent>
					</Card>

					<Card
						className='overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-accent/15 to-accent/5 border-accent/30 animate-fade-in'
						style={{ animationDelay: '0.5s' }}>
						<CardContent className='p-8 flex items-center justify-between'>
							<div>
								<h4 className='text-xl font-bold mb-2 text-accent-foreground'>
									How to sell your product
								</h4>
								<Button
									variant='outline'
									className='border-accent/40 text-accent-foreground hover:bg-accent/10'
									onClick={() => navigate.push('/how-to-sell')}>
									Learn More →
								</Button>
							</div>
							<div className='text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'>
								💰
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default HighlightedFeature;
