'use client';


import React, { useEffect, useState, useMemo } from 'react';

import {
	Facebook,
	Twitter,
	Youtube,
	X,
	Instagram,
	Linkedin,
} from 'react-feather';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle } from 'lucide-react';

const SocialMediaLinks = () => {
    
	const [email, setEmail] = useState('');
	const [subscribing, setSubscribing] = useState(false);
	const handleSubscribe = async () => {
		if (!email) {
			toast.error('Please enter your email address');
			return;
		}

		setSubscribing(true);

		try {
			// Simulate API call for newsletter subscription
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success('Successfully subscribed to our newsletter!');
			setEmail('');
		} catch (error) {
			toast.error('Failed to subscribe. Please try again.');
		} finally {
			setSubscribing(false);
		}
	};

	return (
		<section className='py-3 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground relative overflow-hidden'>
			<div className='container mx-auto px-4 text-center relative z-10'>
				{/* <div className='flex items-center justify-center space-x-2 mb-4'>
						<Badge
							variant='outline'
							className='bg-white/10 text-white border-white/20'>
							📧 NEWSLETTER
						</Badge>
					</div>
					<h3 className='text-3xl font-bold mb-4'>Never Miss an Auction</h3>
					<p className='text-lg mb-8 opacity-90 max-w-2xl mx-auto'>
						Get exclusive notifications about upcoming auctions, rare finds, and
						special events. Join thousands of satisfied bidders!
					</p>
					<div className='flex flex-col sm:flex-row max-w-md mx-auto gap-4 mb-6'>
						<Input
							type='email'
							placeholder='Enter your email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40'
							onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
						/>
						<Button
							variant='secondary'
							className='bg-white text-primary hover:bg-white/90 min-w-[120px]'
							onClick={handleSubscribe}
							disabled={subscribing}>
							{subscribing ? (
								<>
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
									Subscribing...
								</>
							) : (
								<>
									<Mail className='mr-2 h-4 w-4' />
									Subscribe
								</>
							)}
						</Button>
					</div>

					<div className='flex items-center justify-center gap-2 text-sm opacity-75 mb-8'>
						<CheckCircle className='h-4 w-4' />
						<span>Free to join • Unsubscribe anytime • No spam</span>
					</div> */}

				{/* Social Media Section */}
				<div className='mb-3'>
					<p className='text-lg font-semibold mb-4'>Follow Us</p>
					<div className='flex items-center justify-center space-x-6'>
						<a
							href='https://www.facebook.com/profile.php?id=61578344332113'
							target='_blank'
							rel='noopener noreferrer'
							className='group'>
							<div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse'>
								<Facebook className='h-6 w-6 text-white group-hover:text-blue-300' />
							</div>
						</a>
						<a
							href='https://x.com/azbidofficial'
							target='_blank'
							rel='noopener noreferrer'
							className='group'>
							<div
								className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse'
								style={{ animationDelay: '0.5s' }}>
								<X className='h-6 w-6 text-white group-hover:text-sky-300' />
							</div>
						</a>
						<a
							href='https://www.instagram.com/azbid.official/?hl=en'
							target='_blank'
							rel='noopener noreferrer'
							className='group'>
							<div
								className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse'
								style={{ animationDelay: '1s' }}>
								<Instagram className='h-6 w-6 text-white group-hover:text-pink-300' />
							</div>
						</a>
						<a
							href='https://www.youtube.com/@azbid.auction'
							target='_blank'
							rel='noopener noreferrer'
							className='group'>
							<div
								className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse'
								style={{ animationDelay: '1.5s' }}>
								<Youtube className='h-6 w-6 text-white group-hover:text-red-300' />
							</div>
						</a>
						<a
							href='https://www.linkedin.com/feed/'
							target='_blank'
							rel='noopener noreferrer'
							className='group'>
							<div
								className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse'
								style={{ animationDelay: '1.5s' }}>
								<Linkedin className='h-6 w-6 text-white group-hover:text-red-300' />
							</div>
						</a>
					</div>
				</div>

				{/* <div>
						<p className='text-sm opacity-75 mb-4'>Secured Payment Gateways</p>
						<div className='flex items-center justify-center space-x-6 opacity-75'>
							<div className='bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition-colors'>
								VISA
							</div>
							<div className='bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition-colors'>
								MasterCard
							</div>
							<div className='bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition-colors'>
								AMEX
							</div>
							<div className='bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition-colors'>
								PayPal
							</div>
						</div>
					</div> */}
			</div>

			{/* Animated background elements */}
			<div className='absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse'></div>
			<div
				className='absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full animate-bounce'
				style={{ animationDelay: '1s' }}></div>
			<div
				className='absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full animate-ping'
				style={{ animationDelay: '2s' }}></div>
		</section>
	);
};
export default SocialMediaLinks;
