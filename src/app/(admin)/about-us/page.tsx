'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	Gavel,
	Users,
	ShieldCheck,
	Trophy,
	Target,
	Heart,
	CheckCircle,
	Star,
	Award,
	TrendingUp,
} from 'lucide-react';

const AboutUs = () => {
	const navigate = useRouter();

	const values = [
		{
			icon: ShieldCheck,
			title: 'Trust & Security',
			description:
				'We prioritize the security of every transaction and ensure a safe bidding environment for all users.',
		},
		{
			icon: Users,
			title: 'Community First',
			description:
				'Building a strong community of buyers and sellers who share the passion for unique finds and great deals.',
		},
		{
			icon: Trophy,
			title: 'Excellence',
			description:
				'We strive for excellence in everything we do, from platform performance to customer service.',
		},
		{
			icon: Heart,
			title: 'Passion',
			description:
				'Our passion for connecting people with extraordinary items drives our innovation and dedication.',
		},
	];

	const stats = [
		{
			icon: Users,
			number: '50,000+',
			label: 'Active Users',
			color: 'text-blue-600',
		},
		{
			icon: Gavel,
			number: '10,000+',
			label: 'Successful Auctions',
			color: 'text-green-600',
		},
		{
			icon: Trophy,
			number: '98%',
			label: 'Customer Satisfaction',
			color: 'text-yellow-600',
		},
		{
			icon: TrendingUp,
			number: '$2M+',
			label: 'Total Transaction Value',
			color: 'text-purple-600',
		},
	];

	const team = [
		{
			name: 'Sarah Johnson',
			role: 'CEO & Founder',
			description:
				'Visionary leader with 15+ years in e-commerce and auction platforms.',
			avatar: '👩‍💼',
		},
		{
			name: 'Michael Chen',
			role: 'CTO',
			description:
				'Tech innovator ensuring our platform stays cutting-edge and secure.',
			avatar: '👨‍💻',
		},
		{
			name: 'Emily Rodriguez',
			role: 'Head of Operations',
			description:
				'Operations expert focused on seamless user experience and efficiency.',
			avatar: '👩‍💼',
		},
		{
			name: 'David Kim',
			role: 'Head of Security',
			description:
				'Cybersecurity specialist protecting our users and their transactions.',
			avatar: '👨‍🔧',
		},
	];

	const milestones = [
		{
			year: '2020',
			event:
				'AZ-Bid was founded with a vision to revolutionize online auctions',
		},
		{
			year: '2021',
			event: 'Reached 10,000 registered users and launched mobile app',
		},
		{
			year: '2022',
			event:
				'Expanded to international markets and added multi-currency support',
		},
		{
			year: '2023',
			event: 'Achieved 1 million successful transactions milestone',
		},
		{
			year: '2024',
			event:
				'Launched AI-powered recommendation system and advanced security features',
		},
	];

	return (
		<div className='min-h-screen bg-background'>
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
						<Button onClick={() => navigate.push('/auth')}>
							Join Our Community
						</Button>
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 py-8'>
				{/* Hero Section */}
				<section className='text-center py-16 bg-gradient-subtle rounded-lg mb-12'>
					<div className='max-w-4xl mx-auto'>
						<h1 className='text-4xl md:text-5xl font-bold mb-6'>
							About{' '}
							<span className='bg-gradient-primary bg-clip-text text-transparent'>
								AZ-Bid
							</span>
						</h1>
						<p className='text-xl text-muted-foreground mb-8 leading-relaxed'>
							We're revolutionizing the auction experience by connecting
							passionate buyers with unique sellers, creating a trusted
							marketplace where extraordinary items find their perfect owners.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button size='lg' onClick={() => navigate.push('/live-auctions')}>
								<Gavel className='mr-2 h-5 w-5' />
								Explore Auctions
							</Button>
							<Button
								variant='outline'
								size='lg'
								onClick={() => navigate.push('/contact')}>
								Get in Touch
							</Button>
						</div>
					</div>
				</section>

				{/* Mission Statement */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Our Mission</h2>
						<p className='text-muted-foreground max-w-3xl mx-auto text-lg'>
							To create the world's most trusted and exciting auction platform,
							where every bid tells a story and every transaction builds lasting
							relationships.
						</p>
					</div>
				</section>

				{/* Values */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Our Values</h2>
						<p className='text-muted-foreground'>
							The principles that guide everything we do
						</p>
					</div>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{values.map((value, index) => (
							<Card
								key={index}
								className='text-center hover:shadow-lg transition-shadow'>
								<CardContent className='p-6'>
									<value.icon className='h-12 w-12 text-primary mx-auto mb-4' />
									<h3 className='text-xl font-semibold mb-3'>{value.title}</h3>
									<p className='text-muted-foreground'>{value.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Stats */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Our Impact</h2>
						<p className='text-muted-foreground'>
							Numbers that reflect our growing community
						</p>
					</div>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
						{stats.map((stat, index) => (
							<Card
								key={index}
								className='text-center hover:shadow-lg transition-shadow'>
								<CardContent className='p-6'>
									<stat.icon
										className={`h-12 w-12 mx-auto mb-3 ${stat.color}`}
									/>
									<div className='text-3xl font-bold mb-1'>{stat.number}</div>
									<div className='text-sm text-muted-foreground'>
										{stat.label}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Team */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Meet Our Team</h2>
						<p className='text-muted-foreground'>
							The passionate people behind AZ-Bid
						</p>
					</div>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{team.map((member, index) => (
							<Card
								key={index}
								className='text-center hover:shadow-lg transition-shadow'>
								<CardContent className='p-6'>
									<div className='text-6xl mb-4'>{member.avatar}</div>
									<h3 className='text-xl font-semibold mb-1'>{member.name}</h3>
									<Badge variant='secondary' className='mb-3'>
										{member.role}
									</Badge>
									<p className='text-sm text-muted-foreground'>
										{member.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Timeline */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold mb-4'>Our Journey</h2>
						<p className='text-muted-foreground'>
							Key milestones in our growth story
						</p>
					</div>
					<div className='max-w-3xl mx-auto'>
						{milestones.map((milestone, index) => (
							<div
								key={index}
								className='flex items-start gap-4 mb-8 last:mb-0'>
								<div className='flex-shrink-0'>
									<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold'>
										{milestone.year.slice(-2)}
									</div>
								</div>
								<div className='flex-grow'>
									<h3 className='text-lg font-semibold mb-1'>
										{milestone.year}
									</h3>
									<p className='text-muted-foreground'>{milestone.event}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* CTA Section */}
				<section className='text-center py-16 bg-gradient-subtle rounded-lg'>
					<div className='max-w-2xl mx-auto'>
						<h2 className='text-3xl font-bold mb-4'>
							Ready to Join Our Community?
						</h2>
						<p className='text-muted-foreground mb-8 text-lg'>
							Whether you're looking to buy unique items or sell your treasures,
							AZ-Bid is the perfect place to start your auction journey.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button size='lg' onClick={() => navigate('/auth')}>
								<Users className='mr-2 h-5 w-5' />
								Get Started Today
							</Button>
							<Button
								variant='outline'
								size='lg'
								onClick={() => navigate('/how-to-buy')}>
								Learn How to Buy
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AboutUs;
