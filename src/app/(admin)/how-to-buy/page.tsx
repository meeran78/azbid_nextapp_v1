'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	Gavel,
	User,
	Search,
	Eye,
	DollarSign,
	Trophy,
	CreditCard,
	Truck,
	Shield,
	CheckCircle,
	AlertTriangle,
	Clock,
	Star,
	Users,
	MessageCircle,
} from 'lucide-react';

const HowToBuy = () => {
	const navigate = useRouter();

	const steps = [
		{
			step: 1,
			icon: User,
			title: 'Create Your Account',
			description:
				'Sign up for free and verify your email address to get started.',
			details: [
				'Choose between buyer, seller, or admin account types',
				'Verify your email address',
				'Complete your profile with basic information',
				'Set up two-factor authentication for security',
			],
		},
		{
			step: 2,
			icon: CreditCard,
			title: 'Add Payment Method',
			description:
				'Securely add your preferred payment method to your account.',
			details: [
				'Add credit/debit cards or PayPal account',
				'All payment information is encrypted and secure',
				'Set a default payment method for quick bidding',
				'You can manage multiple payment methods',
			],
		},
		{
			step: 3,
			icon: Search,
			title: 'Browse & Search',
			description:
				'Explore thousands of live auctions and find items you love.',
			details: [
				'Use our advanced search filters',
				'Browse by category, condition, or price range',
				'Save items to your watchlist',
				'Set up alerts for specific items or searches',
			],
		},
		{
			step: 4,
			icon: Eye,
			title: 'Research Items',
			description:
				'Carefully examine item details, photos, and seller information.',
			details: [
				'View high-resolution photos from multiple angles',
				'Read detailed item descriptions and conditions',
				'Check seller ratings and reviews',
				'Review auction terms and shipping costs',
			],
		},
		{
			step: 5,
			icon: DollarSign,
			title: 'Place Your Bids',
			description: 'Bid strategically on items you want to win.',
			details: [
				'Set your maximum bid amount',
				'Use proxy bidding to bid automatically',
				'Monitor auction countdown timers',
				'Receive real-time notifications on bid status',
			],
		},
		{
			step: 6,
			icon: Trophy,
			title: 'Win & Pay',
			description: 'If you win, payment is processed automatically.',
			details: [
				'Instant notification when you win an auction',
				'Automatic payment processing',
				'Receive detailed invoice and receipt',
				'Review and rate your purchase experience',
			],
		},
		{
			step: 7,
			icon: Truck,
			title: 'Receive Your Item',
			description: 'Track your shipment and enjoy your new purchase.',
			details: [
				'Receive shipping confirmation with tracking number',
				'Monitor delivery progress in real-time',
				'Inspect items upon delivery',
				'Contact support if there are any issues',
			],
		},
	];

	const tips = [
		{
			icon: Clock,
			title: 'Timing is Everything',
			description:
				'Many auctions heat up in the final minutes. Be prepared to bid quickly near the end.',
		},
		{
			icon: Shield,
			title: 'Set Bid Limits',
			description:
				'Decide your maximum bid beforehand and stick to it to avoid overspending.',
		},
		{
			icon: Star,
			title: 'Check Seller Ratings',
			description:
				'Always review seller ratings and feedback before bidding on expensive items.',
		},
		{
			icon: MessageCircle,
			title: 'Ask Questions',
			description:
				"Don't hesitate to contact sellers with questions about items before bidding.",
		},
	];

	const biddingStrategies = [
		{
			strategy: 'Proxy Bidding',
			description:
				'Set your maximum bid and let our system bid for you automatically.',
			pros: [
				'Saves time',
				'Prevents emotional overbidding',
				'Works even when offline',
			],
			cons: ['May reveal your maximum early', 'Less control over timing'],
		},
		{
			strategy: 'Last-Minute Bidding',
			description: 'Place your bid in the final seconds of the auction.',
			pros: [
				'Maximum surprise factor',
				'Prevents bid wars',
				'Often wins at lower prices',
			],
			cons: [
				'Risky if connection fails',
				'Requires perfect timing',
				'Stressful approach',
			],
		},
		{
			strategy: 'Incremental Bidding',
			description: 'Gradually increase your bids throughout the auction.',
			pros: ['Stay engaged', 'Test competition', 'Flexible approach'],
			cons: [
				'Can drive up prices',
				'Time-consuming',
				'May encourage others to bid',
			],
		},
	];

	return (
		<div className='min-h-screen bg-background'>
			{' '}
			{/* Header */}
			<header className='border-b border-border bg-card/50 backdrop-blur-sm'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<Button variant='ghost' size='sm' onClick={() => navigate.push('/')}>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Home
							</Button>
						</div>
						<Button onClick={() => navigate.push('/auth')}>Get Started</Button>
					</div>
				</div>
			</header>
			<div className='container mx-auto px-4 py-8'>
				{/* Hero Section */}
				<section className='text-center py-12 mb-12'>
					<h1 className='text-4xl font-bold mb-4'>
						How to{' '}
						<span className='bg-gradient-primary bg-clip-text text-transparent'>
							Buy
						</span>{' '}
						on AZ-Bid
					</h1>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
						Your complete guide to successful bidding and winning amazing items
						at great prices. Follow our step-by-step process to become a savvy
						auction buyer.
					</p>
				</section>

				{/* Step-by-Step Guide */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>
							7 Simple Steps to Success
						</h2>
						<p className='text-muted-foreground'>
							Follow this proven process to start winning auctions today
						</p>
					</div>

					<div className='space-y-8'>
						{steps.map((step, index) => (
							<Card key={index} className='hover:shadow-lg transition-shadow'>
								<CardContent className='p-8'>
									<div className='flex flex-col md:flex-row gap-6'>
										<div className='flex-shrink-0'>
											<div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center'>
												<step.icon className='h-8 w-8 text-primary-foreground' />
											</div>
										</div>
										<div className='flex-grow'>
											<div className='flex items-center gap-3 mb-3'>
												<Badge variant='secondary'>Step {step.step}</Badge>
												<h3 className='text-2xl font-bold'>{step.title}</h3>
											</div>
											<p className='text-muted-foreground mb-4 text-lg'>
												{step.description}
											</p>
											<ul className='space-y-2'>
												{step.details.map((detail, detailIndex) => (
													<li
														key={detailIndex}
														className='flex items-start gap-2'>
														<CheckCircle className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
														<span className='text-sm'>{detail}</span>
													</li>
												))}
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Bidding Strategies */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>
							Winning Bidding Strategies
						</h2>
						<p className='text-muted-foreground'>
							Choose the right approach for different auction situations
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-6'>
						{biddingStrategies.map((strategy, index) => (
							<Card key={index} className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<CardTitle className='text-xl'>{strategy.strategy}</CardTitle>
									<p className='text-muted-foreground'>
										{strategy.description}
									</p>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div>
											<h4 className='font-semibold text-green-600 mb-2'>
												Pros:
											</h4>
											<ul className='space-y-1'>
												{strategy.pros.map((pro, proIndex) => (
													<li
														key={proIndex}
														className='flex items-center gap-2 text-sm'>
														<CheckCircle className='h-4 w-4 text-green-500' />
														{pro}
													</li>
												))}
											</ul>
										</div>
										<div>
											<h4 className='font-semibold text-orange-600 mb-2'>
												Cons:
											</h4>
											<ul className='space-y-1'>
												{strategy.cons.map((con, conIndex) => (
													<li
														key={conIndex}
														className='flex items-center gap-2 text-sm'>
														<AlertTriangle className='h-4 w-4 text-orange-500' />
														{con}
													</li>
												))}
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Pro Tips */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Pro Tips for Success</h2>
						<p className='text-muted-foreground'>
							Learn from experienced bidders and improve your win rate
						</p>
					</div>

					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{tips.map((tip, index) => (
							<Card
								key={index}
								className='text-center hover:shadow-lg transition-shadow'>
								<CardContent className='p-6'>
									<tip.icon className='h-12 w-12 text-primary mx-auto mb-4' />
									<h3 className='text-lg font-semibold mb-3'>{tip.title}</h3>
									<p className='text-muted-foreground text-sm'>
										{tip.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Safety & Security */}
				<section className='mb-16'>
					<Card className='bg-gradient-subtle'>
						<CardContent className='p-8'>
							<div className='text-center mb-8'>
								<Shield className='h-16 w-16 text-primary mx-auto mb-4' />
								<h2 className='text-3xl font-bold mb-4'>
									Your Safety is Our Priority
								</h2>
								<p className='text-muted-foreground max-w-2xl mx-auto'>
									We've implemented multiple layers of security to protect your
									transactions and personal information.
								</p>
							</div>

							<div className='grid md:grid-cols-3 gap-6'>
								<div className='text-center'>
									<CheckCircle className='h-8 w-8 text-green-500 mx-auto mb-3' />
									<h3 className='font-semibold mb-2'>Secure Payments</h3>
									<p className='text-sm text-muted-foreground'>
										All transactions are encrypted and processed through secure
										payment gateways.
									</p>
								</div>
								<div className='text-center'>
									<CheckCircle className='h-8 w-8 text-green-500 mx-auto mb-3' />
									<h3 className='font-semibold mb-2'>Verified Sellers</h3>
									<p className='text-sm text-muted-foreground'>
										All sellers go through identity verification and are rated
										by the community.
									</p>
								</div>
								<div className='text-center'>
									<CheckCircle className='h-8 w-8 text-green-500 mx-auto mb-3' />
									<h3 className='font-semibold mb-2'>Buyer Protection</h3>
									<p className='text-sm text-muted-foreground'>
										Comprehensive buyer protection policy covers your purchases
										and disputes.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* CTA Section */}
				<section className='text-center py-12 bg-gradient-subtle rounded-lg'>
					<h2 className='text-3xl font-bold mb-4'>Ready to Start Bidding?</h2>
					<p className='text-muted-foreground mb-8 max-w-2xl mx-auto text-lg'>
						Join thousands of successful buyers who have found amazing deals on
						AZ-Bid. Create your account today and start winning!
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button size='lg' onClick={() => navigate.push('/auth')}>
							<User className='mr-2 h-5 w-5' />
							Create Account
						</Button>
						<Button
							variant='outline'
							size='lg'
							onClick={() => navigate.push('/live-auctions')}>
							<Gavel className='mr-2 h-5 w-5' />
							Browse Live Auctions
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default HowToBuy;
