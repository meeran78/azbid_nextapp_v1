'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	Gavel,
	User,
	Camera,
	PenTool,
	DollarSign,
	Calendar,
	TrendingUp,
	Package,
	CheckCircle,
	AlertTriangle,
	Star,
	Eye,
	MessageCircle,
	Shield,
	CreditCard,
	Clock,
	BarChart3,
} from 'lucide-react';

const HowToSell = () => {
	const navigate = useRouter();

	const steps = [
		{
			step: 1,
			icon: User,
			title: 'Create Seller Account',
			description:
				'Sign up and get verified as a trusted seller on our platform.',
			details: [
				'Choose "Seller" account type during registration',
				'Complete identity verification process',
				'Provide business information if applicable',
				'Set up your seller profile and bio',
			],
		},
		{
			step: 2,
			icon: CreditCard,
			title: 'Set Up Payments',
			description:
				"Configure how you'll receive payments from successful sales.",
			details: [
				'Add bank account for direct deposits',
				'Set up PayPal or Stripe for instant transfers',
				'Configure tax information and settings',
				'Choose your preferred payout schedule',
			],
		},
		{
			step: 3,
			icon: Camera,
			title: 'Photograph Your Items',
			description:
				'Take high-quality photos that showcase your items perfectly.',
			details: [
				'Use natural lighting whenever possible',
				'Capture multiple angles and close-up details',
				'Show any flaws or wear honestly',
				'Include size references or measurements',
			],
		},
		{
			step: 4,
			icon: PenTool,
			title: 'Write Compelling Descriptions',
			description: 'Create detailed, honest descriptions that attract bidders.',
			details: [
				'Include all relevant specifications and features',
				'Mention condition, age, and provenance',
				'Use keywords that buyers might search for',
				'Be transparent about any defects or issues',
			],
		},
		{
			step: 5,
			icon: DollarSign,
			title: 'Set Your Pricing',
			description: 'Choose starting bids and reserve prices strategically.',
			details: [
				'Research similar items to gauge market value',
				'Set competitive starting bids to attract interest',
				'Consider reserve prices for valuable items',
				'Factor in fees and shipping costs',
			],
		},
		{
			step: 6,
			icon: Calendar,
			title: 'Schedule Your Auction',
			description: 'Time your auction to maximize visibility and bids.',
			details: [
				'Choose optimal auction duration (3-10 days)',
				'End auctions on Sunday evenings for best results',
				'Consider seasonal trends and holidays',
				'Use featured listing options for high-value items',
			],
		},
		{
			step: 7,
			icon: TrendingUp,
			title: 'Manage & Promote',
			description: 'Monitor your auction and engage with potential buyers.',
			details: [
				'Answer questions promptly and professionally',
				'Share your auctions on social media',
				'Monitor bid activity and adjust if needed',
				'Be responsive to buyer inquiries',
			],
		},
		{
			step: 8,
			icon: Package,
			title: 'Ship & Complete',
			description: 'Pack carefully and ship promptly after auction ends.',
			details: [
				'Pack items securely with appropriate materials',
				'Ship within 1-2 business days of payment',
				'Provide tracking information to buyers',
				'Follow up to ensure satisfaction',
			],
		},
	];

	const tips = [
		{
			icon: Star,
			title: 'Build Your Reputation',
			description:
				'Excellent customer service and honest listings build trust with buyers.',
		},
		{
			icon: Eye,
			title: 'Optimize for Search',
			description:
				'Use relevant keywords in titles and descriptions to help buyers find your items.',
		},
		{
			icon: Clock,
			title: 'Time It Right',
			description:
				'List items when your target audience is most likely to be browsing.',
		},
		{
			icon: MessageCircle,
			title: 'Communicate Clearly',
			description:
				'Quick, professional responses to questions increase buyer confidence.',
		},
	];

	const pricingStrategies = [
		{
			strategy: 'Low Start, No Reserve',
			description:
				'Start bidding low to generate interest and let the market decide.',
			pros: [
				'Attracts more bidders',
				'Creates bidding excitement',
				'Lower listing fees',
			],
			cons: [
				'Risk of selling too low',
				'No price protection',
				'Market dependent',
			],
		},
		{
			strategy: 'Market Price Start',
			description: 'Start at or near current market value for the item.',
			pros: [
				'Protects your investment',
				'Serious bidders only',
				'Predictable outcomes',
			],
			cons: [
				'May discourage bidding',
				'Lower visibility in searches',
				'Slower auction start',
			],
		},
		{
			strategy: 'Reserve Price',
			description: 'Set a hidden minimum price that must be met to sell.',
			pros: [
				'Price protection',
				'Can start low safely',
				'Professional appearance',
			],
			cons: [
				'May discourage bidders',
				'Additional fees',
				'Complexity for buyers',
			],
		},
	];

	const categoryTips = [
		{
			category: 'Electronics',
			tips: [
				'Include model numbers and specs',
				'Test all functions before listing',
				'Mention warranty status',
			],
		},
		{
			category: 'Fashion',
			tips: [
				'Provide accurate measurements',
				'Show fabric labels and care instructions',
				'Model items when possible',
			],
		},
		{
			category: 'Collectibles',
			tips: [
				'Research authenticity and provenance',
				'Highlight rarity and condition',
				'Include certificates if available',
			],
		},
		{
			category: 'Vehicles',
			tips: [
				'Provide maintenance records',
				'Include VIN and title status',
				'Professional inspection recommended',
			],
		},
	];

	return (
		<div className='min-h-screen bg-background'>
			
			<div className='container mx-auto px-4 py-8'>
				{/* Hero Section */}
				<section className='text-center py-12 mb-12'>
					<h1 className='text-4xl font-bold mb-4'>
						How to{' '}
						<span className=' bg-clip-text text-primary'>
							Sell
						</span>{' '}
						on AZ-Bid
					</h1>
					<p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
						Turn your unused items into cash with our comprehensive seller
						guide. Learn proven strategies to maximize your auction success and
						build a thriving selling business.
					</p>
				</section>

				{/* Step-by-Step Guide */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>
							8 Steps to Selling Success
						</h2>
						<p className='text-muted-foreground'>
							Master the art of online auctions with our detailed process
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

				{/* Pricing Strategies */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>
							Pricing Strategies That Work
						</h2>
						<p className='text-muted-foreground'>
							Choose the right pricing approach for your items and goals
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-6'>
						{pricingStrategies.map((strategy, index) => (
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
						<h2 className='text-3xl font-bold mb-4'>Seller Success Tips</h2>
						<p className='text-muted-foreground'>
							Insider knowledge from our top-performing sellers
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

				{/* Category-Specific Tips */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>
							Category-Specific Advice
						</h2>
						<p className='text-muted-foreground'>
							Tailored tips for different types of items
						</p>
					</div>

					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{categoryTips.map((category, index) => (
							<Card key={index} className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<CardTitle className='text-lg'>{category.category}</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className='space-y-2'>
										{category.tips.map((tip, tipIndex) => (
											<li key={tipIndex} className='flex items-start gap-2'>
												<CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
												<span className='text-sm'>{tip}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Fees & Earnings */}
				<section className='mb-16'>
					<Card className='bg-gradient-subtle'>
						<CardContent className='p-8'>
							<div className='text-center mb-8'>
								<BarChart3 className='h-16 w-16 text-primary mx-auto mb-4' />
								<h2 className='text-3xl font-bold mb-4'>
									Transparent Fees & Earnings
								</h2>
								<p className='text-muted-foreground max-w-2xl mx-auto'>
									Understand our fee structure and maximize your profits with
									our seller-friendly rates.
								</p>
							</div>

							<div className='grid md:grid-cols-3 gap-6'>
								<div className='text-center'>
									<div className='text-3xl font-bold text-primary mb-2'>
										2.5%
									</div>
									<h3 className='font-semibold mb-2'>Final Value Fee</h3>
									<p className='text-sm text-muted-foreground'>
										Only charged when your item sells successfully
									</p>
								</div>
								<div className='text-center'>
									<div className='text-3xl font-bold text-primary mb-2'>
										Free
									</div>
									<h3 className='font-semibold mb-2'>Basic Listings</h3>
									<p className='text-sm text-muted-foreground'>
										No upfront costs for standard auction listings
									</p>
								</div>
								<div className='text-center'>
									<div className='text-3xl font-bold text-primary mb-2'>
										24h
									</div>
									<h3 className='font-semibold mb-2'>Fast Payouts</h3>
									<p className='text-sm text-muted-foreground'>
										Receive your earnings within 24 hours of payment
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* Security & Protection */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Seller Protection</h2>
						<p className='text-muted-foreground'>
							We've got your back with comprehensive seller protections
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-6'>
						<Card className='text-center hover:shadow-lg transition-shadow'>
							<CardContent className='p-6'>
								<Shield className='h-12 w-12 text-green-500 mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-3'>
									Payment Protection
								</h3>
								<p className='text-muted-foreground text-sm'>
									Guaranteed payment for all completed transactions with
									verified buyers.
								</p>
							</CardContent>
						</Card>
						<Card className='text-center hover:shadow-lg transition-shadow'>
							<CardContent className='p-6'>
								<CheckCircle className='h-12 w-12 text-blue-500 mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-3'>
									Dispute Resolution
								</h3>
								<p className='text-muted-foreground text-sm'>
									Fair and fast resolution of any disputes or issues with
									buyers.
								</p>
							</CardContent>
						</Card>
						<Card className='text-center hover:shadow-lg transition-shadow'>
							<CardContent className='p-6'>
								<Star className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-3'>
									Reputation System
								</h3>
								<p className='text-muted-foreground text-sm'>
									Build trust with buyers through our transparent rating system.
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* CTA Section */}
				<section className='text-center py-12 bg-gradient-subtle rounded-lg'>
					<h2 className='text-3xl font-bold mb-4'>Ready to Start Selling?</h2>
					<p className='text-muted-foreground mb-8 max-w-2xl mx-auto text-lg'>
						Join thousands of successful sellers who are earning money by
						turning their items into cash. Create your seller account today and
						list your first item!
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button size='lg' onClick={() => navigate('/auth')}>
							<User className='mr-2 h-5 w-5' />
							Create Seller Account
						</Button>
						<Button
							variant='outline'
							size='lg'
							onClick={() => navigate('/contact')}>
							<MessageCircle className='mr-2 h-5 w-5' />
							Ask Questions
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default HowToSell;
