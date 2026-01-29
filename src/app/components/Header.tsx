'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	Clock,
	TrendingUp,
	User,
	Gavel,
	X,
	ShoppingCart,
	Menu,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import azbidLogo from '/images/azbid-logo.jpg';
import azbidlogohammer from '/images/azbid_logo_hammer.gif';

import { useSession } from '@/lib/auth-client';
import { LogIn, UserCircle } from 'lucide-react';

import { SignOutButton } from "@/app/components/SignoutButton";

const Header = () => {
	const [activeAuctions, setActiveAuctions] = useState(425);
	const [searchQuery, setSearchQuery] = useState('');
	const [showCart, setShowCart] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const { data: session } = useSession();
	const isSeller = session?.user?.role === "SELLER";
	const navigate = useRouter();

	useEffect(() => {
		console.log(session);
	}, [session]);

	return (
		<>
			<div className='sm:block bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4'>
				<div className='max-w-7xl mx-auto flex items-center justify-between text-sm'>
					<div className='flex items-center space-x-6'>
						<div className='flex items-center space-x-2 animate-pulse'>
							<Clock size={16} />
							<span className='font-medium'>
								{activeAuctions} Live Auctions
							</span>
						</div>
						<div className='hidden md:flex items-center space-x-2'>
							<TrendingUp size={16} />
							<span>Ending Soon: Vintage Watch Collection</span>
						</div>
					</div>
					<div className='flex items-center space-x-4'>
						<span className=' animate-bounce'> 📧 info@az-bid.com</span>
						<span className='animate-bounce'>📞 24/7 Support</span>
						<span className='hidden sm:inline animate-bounce'>🔥 New Arrivals Daily</span>
					</div>
				</div>
			</div>

			<header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
				<div className=' mx-auto px-4 py-4 '>
					<div className='flex items-center justify-between '>
						<div className='flex items-center space-x-8'>

							<div
								className='flex items-center space-x-3 group cursor-pointer'
								onClick={() => navigate.push('/')}>
								{/* <AnimatedLogo variant="horizontal" size="lg" className="max-h-56 max-w-32" /> */}
								<Image src="/images/azbid-logo.jpg" alt="Logo" width={46} height={26} className='rounded-full' />
							</div>
							<nav className='hidden md:flex items-center space-x-6'>
								{!isSeller && (
									<>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => navigate.push('/')}
											className='hover:scale-105 transition-all duration-200'>
											Home
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => navigate.push('/live-auctions')}
											className='hover:scale-105 transition-all duration-200'>
											Live Auctions
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => navigate.push('/buy-now')}>
											Buy Now
										</Button>
									</>
								)}
								<Button
									variant='ghost'
									size='sm'
									onClick={() => navigate.push('/how-to-buy')}>
									How to Buy
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => navigate.push('/how-to-sell')}>
									How to Sell
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => navigate.push('/about-us')}>
									About Us
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => navigate.push('/contact-us')}>
									Contact Us
								</Button>
							</nav>
						</div>
						{/* Desktop Login Button */}
						<div className="flex gap-4">
							{/* Welcome message for all logged-in users */}
							{session?.user && (
								<p className="flex items-center gap-2">
									<span
										data-role={session.user.role}
										className="size-4 rounded-full animate-pulse data-[role=BUYER]:bg-blue-600 data-[role=SELLER]:bg-purple-600 data-[role=ADMIN]:bg-red-600"
									/>
									Welcome back, {session.user.name}!👋
								</p>
							)}

							{/* Dashboard button - only for BUYER */}
							{session?.user && session?.user?.role === "BUYER" ? (
								<Button
									variant='default'
									size='sm'
									onClick={() => {
										navigate.push('/buyers-dashboard');
									}}
									className='md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none'>
									<UserCircle className='h-4 w-4' />
									<span className='font-medium'>Dashboard</span>
								</Button>
							) : !session?.user ? (
								<Button
									variant='default'
									size='sm'
									onClick={() => navigate.push('/sign-in')}
									className='hidden md:flex items-justify gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group'>
									{/* Animated background effect */}
									<span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></span>
									<LogIn className='h-4 w-4 relative z-10 animate-bounce group-hover:animate-none' />
									<span className='font-medium relative z-10'>Sign In</span>
								</Button>
							) : null}

							{/* Sign Out button for all logged-in users */}
							{session?.user && (
								<div className='flex justify-center'>
									<SignOutButton />
								</div>
							)}
						
						</div>
					

								
						<div className='flex items-center space-x-4'>
							{/* Mobile Hamburger Button */}
							<Button
								variant='ghost'
								size='icon'
								className='md:hidden hover:scale-105 transition-all duration-200'
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
								<div className='relative w-6 h-6'>
									<span
										className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen
											? 'rotate-45 translate-y-1.5'
											: '-translate-y-1'
											}`}></span>
									<span
										className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'translate-y-0.5'
											}`}></span>
									<span
										className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen
											? '-rotate-45 -translate-y-1.5'
											: 'translate-y-2'
											}`}></span>
								</div>
							</Button>


						</div>
					</div>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			<div
				className={`fixed inset-0 z-50 md:hidden  ${isMobileMenuOpen ? 'visible' : 'invisible' 
					}`}>
				{/* Backdrop */}
				<div
					className={`fixed inset-0 bg-black/50 transition-opacity duration-300  ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
						}`}
					onClick={() => setIsMobileMenuOpen(false)}
				/>

				{/* Mobile Menu */}
				<div
					className={`fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
						}`}>
					<div className='flex flex-col h-full'>
						{/* Header */}
						<div className='flex items-center justify-between p-6 border-b border-border'>
							<div className='flex items-center space-x-3'>
								<Gavel className='h-6 w-6 text-primary' />
								<div>
									<h2 className='text-lg font-bold'>AZ-Bid</h2>
									<p className='text-xs text-muted-foreground'>
										Bid High, Win Big
									</p>
								</div>
							</div>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsMobileMenuOpen(false)}
								className='hover:scale-105 transition-all duration-200'>
								<X className='h-5 w-5' />
							</Button>
						</div>

						{/* Search */}
						{/* <div className='p-6 border-b border-border'>
							<div className='flex items-center space-x-2 bg-muted rounded-lg p-3'>
								<Search className='h-4 w-4 text-muted-foreground' />
								<Input
									type='text'
									placeholder='Search auctions...'
									className='border-0 bg-transparent focus:ring-0 focus:outline-none'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											// handleGlobalSearch();
											setIsMobileMenuOpen(false);
										}
									}}
								/>
							</div>
						</div> */}

						{/* Navigation */}
						<div className='flex-1 overflow-y-auto p-6'>
							<nav className='space-y-2'>
								{!isSeller && (
									<>
										<Button
											variant='ghost'
											className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
											onClick={() => {
												navigate.push('/');
												setIsMobileMenuOpen(false);
											}}>
											Home
										</Button>
										<Button
											variant='ghost'
											className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
											onClick={() => {
												navigate.push('/live-auctions');
												setIsMobileMenuOpen(false);
											}}>
											Live Auctions
										</Button>
										<Button
											variant='ghost'
											className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
											onClick={() => {
												navigate.push('/buy-now');
												setIsMobileMenuOpen(false);
											}}>
											Buy Now
										</Button>
									</>
								)}
								<Button
									variant='ghost'
									className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
									onClick={() => {
										navigate.push('/how-to-buy');
										setIsMobileMenuOpen(false);
									}}>
									How to Buy
								</Button>
								<Button
									variant='ghost'
									className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
									onClick={() => {
										navigate.push('/how-to-sell');
										setIsMobileMenuOpen(false);
									}}>
									How to Sell
								</Button>
								<Button
									variant='ghost'
									className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
									onClick={() => {
										navigate.push('/about-us');
										setIsMobileMenuOpen(false);
									}}>
									About Us
								</Button>
								<Button
									variant='ghost'
									className='w-full justify-start text-left hover:scale-105 transition-all duration-200'
									onClick={() => {
										navigate.push('/contact-us');
										setIsMobileMenuOpen(false);
									}}>
									Contact Us
								</Button>
							</nav>
						</div>

						{/* Bottom Actions */}
						<div className='p-6 border-t border-border space-y-3'>
							{/* Cart Button */}
							<Button
								variant='outline'
								className='w-full hover:scale-105 transition-all duration-200'
								onClick={() => {
									setShowCart(true);
									setIsMobileMenuOpen(false);
								}}>
								<ShoppingCart className='h-4 w-4 mr-2' />
								{/* Cart ({getTotalItems()}) */}
							</Button>

							{session?.user && session?.user?.role === "BUYER" ? (
								<Button
									variant='default'
									className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'
									onClick={() => {
										navigate.push('/buyers-dashboard');
										setIsMobileMenuOpen(false);
									}}>
									<UserCircle className='h-4 w-4 mr-2' />
									Dashboard
								</Button>
							) : !session?.user ? (
								<Button
									variant='default'
									className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group'
									onClick={() => {
										navigate.push('/sign-in');
										setIsMobileMenuOpen(false);
									}}>
									{/* Animated shimmer effect */}
									<span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></span>
									<LogIn className='h-4 w-4 mr-2 relative z-10 animate-bounce group-hover:animate-none' />
									<span className='relative z-10 font-medium'>Sign In</span>
								</Button>
							) : null}

							{/* Sign Out button for all logged-in users */}
							{/* {session?.user && (
								<div className='w-full flex justify-center'>
									<SignOutButton />
								</div>
							)} */}

						</div>
					</div>
				</div>
			</div>

			{/* Unified Cart Modal */}
			{/* <UnifiedCart open={showCart} onClose={() => setShowCart(false)} /> */}
		</>
	);
};

export default Header;
