'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	ArrowLeft,
	Gavel,
	Mail,
	Phone,
	MapPin,
	Clock,
	MessageCircle,
	Send,
	CheckCircle,
	HelpCircle,
	Bug,
	Star,
} from 'lucide-react';
import { toast } from 'sonner';

const ContactUs = () => {
	const navigate = useRouter();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		category: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const contactInfo = [
		{
			icon: Mail,
			title: 'Email Us',
			details: 'support@az-bid.com',
			description: "Send us an email and we'll respond within 24 hours",
		},
		{
			icon: Phone,
			title: 'Call Us',
			details: '+1 (555) 123-4567',
			description: 'Mon-Fri 9AM-6PM EST, Sat 10AM-4PM EST',
		},
		{
			icon: MapPin,
			title: 'Visit Us',
			details: '123 Auction Street, Bid City, BC 12345',
			description: 'Our headquarters are open for scheduled visits',
		},
		{
			icon: Clock,
			title: 'Business Hours',
			details: 'Mon-Fri: 9AM-6PM EST',
			description: 'Extended support available on weekends',
		},
	];

	const categories = [
		{ value: 'general', label: 'General Inquiry', icon: MessageCircle },
		{ value: 'support', label: 'Technical Support', icon: HelpCircle },
		{ value: 'billing', label: 'Billing & Payments', icon: Star },
		{ value: 'bug', label: 'Report a Bug', icon: Bug },
		{ value: 'feedback', label: 'Feedback & Suggestions', icon: Star },
		{
			value: 'partnership',
			label: 'Partnership Opportunities',
			icon: CheckCircle,
		},
	];

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate form submission
		setTimeout(() => {
			toast.success(
				"Message sent successfully! We'll get back to you within 24 hours."
			);
			setFormData({
				name: '',
				email: '',
				subject: '',
				category: '',
				message: '',
			});
			setIsSubmitting(false);
		}, 2000);
	};

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
						<Button onClick={() => navigate.push('/auth')}>Sign In</Button>
					</div>
				</div>
			</header>

			<div className='container mx-auto px-4 '>
				{/* Hero Section */}
				<section className='text-center py-12 '>
					<h1 className='text-4xl font-bold'>
						Get in{' '}
						<span className='bg-gradient-primary bg-clip-text text-transparent'>
							Touch
						</span>
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						Have questions, feedback, or need support? We're here to help and
						would love to hear from you.
					</p>
				</section>

				<div className='grid lg:grid-cols-3 gap-8 mb-12'>
					{/* Contact Information */}
					<div className='lg:col-span-1'>
						<h2 className='text-2xl font-bold mb-6'>Contact Information</h2>
						<div className='space-y-6'>
							{contactInfo.map((info, index) => (
								<Card key={index} className='hover:shadow-md transition-shadow'>
									<CardContent className='p-4'>
										<div className='flex items-start gap-3'>
											<info.icon className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
											<div>
												<h3 className='font-semibold mb-1'>{info.title}</h3>
												<p className='text-primary font-medium mb-1'>
													{info.details}
												</p>
												<p className='text-sm text-muted-foreground'>
													{info.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Quick Links */}
						<Card className='mt-6'>
							<CardHeader>
								<CardTitle className='text-lg'>Quick Help</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<Button
									variant='ghost'
									className='w-full justify-start'
									onClick={() => navigate.push('/how-to-buy')}>
									<HelpCircle className='h-4 w-4 mr-2' />
									How to Buy Guide
								</Button>
								<Button
									variant='ghost'
									className='w-full justify-start'
									onClick={() => navigate.push('/how-to-sell')}>
									<HelpCircle className='h-4 w-4 mr-2' />
									How to Sell Guide
								</Button>
								<Button
									variant='ghost'
									className='w-full justify-start'
									onClick={() => navigate.push('/about')}>
									<Star className='h-4 w-4 mr-2' />
									About AZ-Bid
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Contact Form */}
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle className='text-2xl'>Send us a Message</CardTitle>
								<p className='text-muted-foreground'>
									Fill out the form below and we'll get back to you as soon as
									possible.
								</p>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div className='grid md:grid-cols-2 gap-4'>
										<div>
											<label
												htmlFor='name'
												className='block text-sm font-medium mb-2'>
												Full Name *
											</label>
											<Input
												id='name'
												type='text'
												placeholder='Your full name'
												value={formData.name}
												onChange={(e) =>
													handleInputChange('name', e.target.value)
												}
												required
											/>
										</div>
										<div>
											<label
												htmlFor='email'
												className='block text-sm font-medium mb-2'>
												Email Address *
											</label>
											<Input
												id='email'
												type='email'
												placeholder='your.email@example.com'
												value={formData.email}
												onChange={(e) =>
													handleInputChange('email', e.target.value)
												}
												required
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor='category'
											className='block text-sm font-medium mb-2'>
											Category *
										</label>
										<Select
											value={formData.category}
											onValueChange={(value) =>
												handleInputChange('category', value)
											}>
											<SelectTrigger>
												<SelectValue placeholder='Select a category' />
											</SelectTrigger>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem
														key={category.value}
														value={category.value}>
														<div className='flex items-center'>
															<category.icon className='h-4 w-4 mr-2' />
															{category.label}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<label
											htmlFor='subject'
											className='block text-sm font-medium mb-2'>
											Subject *
										</label>
										<Input
											id='subject'
											type='text'
											placeholder='Brief description of your inquiry'
											value={formData.subject}
											onChange={(e) =>
												handleInputChange('subject', e.target.value)
											}
											required
										/>
									</div>

									<div>
										<label
											htmlFor='message'
											className='block text-sm font-medium mb-2'>
											Message *
										</label>
										<Textarea
											id='message'
											placeholder='Please provide detailed information about your inquiry...'
											value={formData.message}
											onChange={(e) =>
												handleInputChange('message', e.target.value)
											}
											rows={6}
											required
										/>
									</div>

									<Button
										type='submit'
										className='w-full'
										disabled={isSubmitting}>
										{isSubmitting ? (
											<>
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
												Sending...
											</>
										) : (
											<>
												<Send className='h-4 w-4 mr-2' />
												Send Message
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<section className='mb-12'>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-bold mb-4'>
							Frequently Asked Questions
						</h2>
						<p className='text-muted-foreground'>
							Find quick answers to common questions
						</p>
					</div>

					<div className='grid md:grid-cols-2 gap-6'>
						<Card>
							<CardContent className='p-6'>
								<h3 className='font-semibold mb-2'>How do I place a bid?</h3>
								<p className='text-muted-foreground text-sm'>
									Simply sign up, browse live auctions, and click "Place Bid" on
									any item you're interested in. You'll need to verify your
									payment method first.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<h3 className='font-semibold mb-2'>
									When do I pay for won items?
								</h3>
								<p className='text-muted-foreground text-sm'>
									Payment is processed automatically when you win an auction.
									You'll receive a confirmation email with shipping details.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<h3 className='font-semibold mb-2'>How do I start selling?</h3>
								<p className='text-muted-foreground text-sm'>
									Create a seller account, verify your identity, and you can
									start listing items immediately. Our seller guide will walk
									you through the process.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<h3 className='font-semibold mb-2'>
									What if I have a dispute?
								</h3>
								<p className='text-muted-foreground text-sm'>
									Our support team handles all disputes fairly and quickly.
									Contact us with your order details and we'll resolve the issue
									within 48 hours.
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* CTA Section */}
				<section className='text-center py-12 bg-gradient-subtle rounded-lg'>
					<h2 className='text-3xl font-bold mb-4'>Still Need Help?</h2>
					<p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
						Our support team is standing by to assist you with any questions or
						concerns you may have.
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							size='lg'
							className='bg-gradient-primary text-primary-foreground hover:scale-105 transition-all duration-200'>
							<Mail className='mr-2 h-5 w-5' />
							Email Support
						</Button>
						<Button
							variant='outline'
							size='lg'
							className='hover:scale-105 transition-all duration-200'>
							<Phone className='mr-2 h-5 w-5' />
							Schedule a Call
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default ContactUs;
