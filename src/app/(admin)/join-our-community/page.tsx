'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerAccountRequestForm } from '@/app/components/SellerAccountRequestForm';
import {
	Gavel,
	Store,
	ShieldCheck,
	Heart,
	Wallet,
	Search,
	Package,
	Banknote,
	MessageCircle,
	Star,
	UserPlus,
	FileText,
} from 'lucide-react';

const buyerBenefits = [
	{
		icon: Search,
		title: 'Discover Unique Finds',
		description:
			'Browse thousands of live auctions across categories updated every day.',
	},
	{
		icon: ShieldCheck,
		title: 'Secure Bidding & Payments',
		description:
			'Every transaction is protected with verified payment methods and buyer safeguards.',
	},
	{
		icon: Heart,
		title: 'Track Favorites & Bids',
		description:
			'Save items you love and follow your bid history from your buyer dashboard.',
	},
	{
		icon: Wallet,
		title: 'Transparent Pricing',
		description:
			'No hidden fees. Know exactly what you are paying before you place a bid.',
	},
];

const sellerBenefits = [
	{
		icon: Package,
		title: 'List Items for Free',
		description:
			'No upfront costs for standard auction listings — only pay when you sell.',
	},
	{
		icon: Banknote,
		title: 'Fast 24h Payouts',
		description:
			'Receive your earnings within 24 hours of a successful, completed sale.',
	},
	{
		icon: MessageCircle,
		title: 'Reach Thousands of Buyers',
		description:
			'Get your items in front of an active, engaged community of bidders.',
	},
	{
		icon: Star,
		title: 'Seller Protection',
		description:
			'Guaranteed payment on completed transactions and fast dispute resolution.',
	},
];

const JoinOurCommunity = () => {
	const navigate = useRouter();
	const searchParams = useSearchParams();
	const initialTab = searchParams.get('type') === 'seller' ? 'seller' : 'buyer';

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-12'>
				{/* Hero */}
				<section className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4'>
						Join Our{' '}
						<span className='text-gradient-primary italic'>Community</span>
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						Whether you&apos;re here to bid on unique finds or turn your items
						into cash, AZ-Bid has a path for you.
					</p>
				</section>

				{/* Buyer / Seller Tabs */}
				<section className='max-w-5xl mx-auto mb-16'>
					<Tabs defaultValue={initialTab} className='w-full'>
						<div className='flex justify-center mb-8'>
							<TabsList className='h-auto p-1'>
								<TabsTrigger value='buyer' className='px-6 py-2 text-base gap-2'>
									<Gavel className='h-4 w-4' />
									I Want to Buy
								</TabsTrigger>
								<TabsTrigger value='seller' className='px-6 py-2 text-base gap-2'>
									<Store className='h-4 w-4' />
									I Want to Sell
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Buyer Path */}
						<TabsContent value='buyer' className='space-y-8'>
							<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
								{buyerBenefits.map((benefit, index) => (
									<Card
										key={index}
										className='text-center hover:shadow-lg transition-shadow'>
										<CardContent className='p-6'>
											<benefit.icon className='h-10 w-10 text-primary mx-auto mb-4' />
											<h3 className='font-semibold mb-2'>{benefit.title}</h3>
											<p className='text-sm text-muted-foreground'>
												{benefit.description}
											</p>
										</CardContent>
									</Card>
								))}
							</div>

							<Card className='bg-gradient-subtle'>
								<CardContent className='p-8 text-center'>
									<UserPlus className='h-12 w-12 text-primary mx-auto mb-4' />
									<h2 className='text-2xl font-bold mb-2'>
										Create Your Buyer Account
									</h2>
									<p className='text-muted-foreground mb-6 max-w-xl mx-auto'>
										Sign up in minutes and start bidding on live auctions
										right away.
									</p>
									<div className='flex flex-col sm:flex-row gap-4 justify-center'>
										<Button size='lg' onClick={() => navigate.push('/sign-up')}>
											<UserPlus className='mr-2 h-5 w-5' />
											Create Buyer Account
										</Button>
										<Button
											variant='outline'
											size='lg'
											onClick={() => navigate.push('/how-to-buy')}>
											Learn How to Buy
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Seller Path */}
						<TabsContent value='seller' className='space-y-8'>
							<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
								{sellerBenefits.map((benefit, index) => (
									<Card
										key={index}
										className='text-center hover:shadow-lg transition-shadow'>
										<CardContent className='p-6'>
											<benefit.icon className='h-10 w-10 text-primary mx-auto mb-4' />
											<h3 className='font-semibold mb-2'>{benefit.title}</h3>
											<p className='text-sm text-muted-foreground'>
												{benefit.description}
											</p>
										</CardContent>
									</Card>
								))}
							</div>

							<Card className='bg-gradient-subtle'>
								<CardContent className='p-8 text-center'>
									<FileText className='h-12 w-12 text-primary mx-auto mb-4' />
									<h2 className='text-2xl font-bold mb-2'>
										Become a Seller
									</h2>
									<p className='text-muted-foreground mb-2 max-w-xl mx-auto'>
										Create your account and submit your company details below
										in one step. Admin will review, send contract details, and
										activate your seller access after acknowledgement.
									</p>
									<Button
										variant='link'
										onClick={() => navigate.push('/sign-in')}>
										Already have an account? Sign in first
									</Button>
								</CardContent>
							</Card>

							<SellerAccountRequestForm />
						</TabsContent>
					</Tabs>
				</section>

				{/* Bottom CTA */}
				<section className='text-center py-12 bg-gradient-subtle rounded-lg'>
					<h2 className='text-3xl font-bold mb-4'>Still Have Questions?</h2>
					<p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
						Reach out to our team and we will help you find the right path to
						get started.
					</p>
					<Button
						variant='outline'
						size='lg'
						onClick={() => navigate.push('/contact-us')}>
						Contact Us
					</Button>
				</section>
			</div>
		</div>
	);
};

export default JoinOurCommunity;
