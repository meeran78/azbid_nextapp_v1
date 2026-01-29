'use client';
import React from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {  
    Phone,
    MapPin,
    Gavel,
    ShieldCheck,
	
} from 'lucide-react';

type Props = {}

const Footer = (props: Props) => {
	const navigate = useRouter();
  return (

			<footer className='bg-foreground text-background py-16'>
				<div className='container mx-auto px-4'>
					<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
						{/* Company Info */}
						<div>
							<div className='flex items-center space-x-2 mb-4'>
								<Gavel className='h-8 w-8 text-primary' />
								<h4 className='text-xl font-bold'>AZ-Bid</h4>
							</div>
							<p className='text-muted-foreground mb-4 text-sm'>
								The world's leading online auction platform connecting
								collectors, dealers, and enthusiasts worldwide.
							</p>
							<div className='flex items-center space-x-2 text-sm'>
								<ShieldCheck className='h-4 w-4 text-primary' />
								<span>Secure & Trusted Platform</span>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h5 className='font-semibold mb-4'>Quick Links</h5>
							<ul className='space-y-2 text-sm'>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/live-auctions')}>
										Live Auctions
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/category/electronics')}>
										Browse Categories
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/how-to-sell')}>
										Sell with Us
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/auction-calendar')}>
										Auction Calendar
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/results-prices')}>
										Results & Prices
									</Button>
								</li>
								{/* <li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate('/auth')}>
										Authentication
									</Button>
								</li> */}
							</ul>
						</div>

						{/* Support */}
						<div>
							<h5 className='font-semibold mb-4'>Support</h5>
							<ul className='space-y-2 text-sm'>
								{/* <li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/help-support')}>
										Help Center
									</Button>
								</li> */}
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/how-to-buy')}>
										Bidding Guide
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/shipping-info')}>
										Shipping Info
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/returns-policy')}>
										Returns Policy
									</Button>
								</li>
								<li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/contact-us')}>
										Contact Us
									</Button>
								</li>
								{/* <li>
									<Button
										variant='link'
										size='sm'
										className='h-auto p-0 text-muted-foreground hover:text-background'
										onClick={() => navigate.push('/live-chat')}>
										Live Chat
									</Button>
								</li> */}
							</ul>
						</div>

						{/* Contact */}
						<div>
							<h5 className='font-semibold mb-4'>Contact</h5>
							<div className='space-y-3 text-sm'>
								<div className='flex items-start space-x-2'>
									<MapPin className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
									<span className='text-muted-foreground'>
										123 Auction Street
										<br />
										New York, NY 10001
									</span>
								</div>
								<div className='flex items-center space-x-2'>
									<Phone className='h-4 w-4 text-primary flex-shrink-0' />
									<span className='text-muted-foreground'>
										+1 (555) 123-4567
									</span>
								</div>
								<div className='flex items-center space-x-2'>
									<span className='text-muted-foreground'>info@az-bid.com</span>
								</div>
							</div>
							
						</div>
					</div>

					<div className='border-t border-muted-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm'>
						<div className='text-muted-foreground mb-4 md:mb-0'>
							© 2025 AZ-Bid. All rights reserved.
						</div>
						<div className='flex space-x-6 text-muted-foreground'>
							<Button
								variant='link'
								size='sm'
								className='h-auto p-0 text-muted-foreground hover:text-background'
								onClick={() => navigate.push('/privacy-policy')}>
								Privacy Policy
							</Button>
							<Button
								variant='link'
								size='sm'
								className='h-auto p-0 text-muted-foreground hover:text-background'
								onClick={() => navigate.push('/terms-conditions')}>
								Terms of Service
							</Button>
							<Button
								variant='link'
								size='sm'
								className='h-auto p-0 text-muted-foreground hover:text-background'
								onClick={() => navigate.push('/cookie-policy')}>
								Cookie Policy
							</Button>
						</div>
						<div className='text-muted-foreground mt-4 md:mt-0'>
							🟢 System Status: All Systems Operational
						</div>
					</div>
				</div>
			</footer>
  )
}

export default Footer;