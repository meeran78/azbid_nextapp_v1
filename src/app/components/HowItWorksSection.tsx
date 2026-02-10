import { Search,  Gavel, Users, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const HowItWorksSection = () => {
	return (
		<section className='py-16 bg-gradient-subtle'>
			<div className='container mx-auto px-4'>
			<div className='text-center mb-12'>
				
				<div className='flex items-center justify-center space-x-2 mb-4'>
						<Badge
						variant='outline'
							className='bg-primary/10 text-primary border-primary/20'>
							⭐ FOLLOW 4 STEP
						</Badge>
					</div>
					<h3 className='text-4xl font-bold mb-4'>
						How It's <span className='italic'>Work</span>
					</h3>
				</div>

				<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
					<div className='text-center group animate-fade-in'>
						<div className='bg-card rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<Users className='h-8 w-8 text-primary' />
							</div>
							<div className='bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block'>
								Step-01
							</div>
							<h4 className='text-lg font-semibold mb-2'>Registration</h4>
							<p className='text-muted-foreground text-sm'>
								Create your account to start bidding. Quick and easy
								registration process.
							</p>
						</div>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.1s' }}>
						<div className='bg-card rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<Search className='h-8 w-8 text-primary' />
							</div>
							<div className='bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block'>
								Step-02
							</div>
							<h4 className='text-lg font-semibold mb-2'>Select Product</h4>
							<p className='text-muted-foreground text-sm'>
								Browse through our extensive catalog of auction items and find
								what you want.
							</p>
						</div>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.2s' }}>
						<div className='bg-card rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<Gavel className='h-8 w-8 text-primary' />
							</div>
							<div className='bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block'>
								Step-03
							</div>
							<h4 className='text-lg font-semibold mb-2'>Make Payment</h4>
							<p className='text-muted-foreground text-sm'>
								Secure payment processing with multiple payment options
								available.
							</p>
						</div>
					</div>

					<div
						className='text-center group animate-fade-in'
						style={{ animationDelay: '0.3s' }}>
						<div className='bg-card rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<Trophy className='h-8 w-8 text-primary' />
							</div>
							<div className='bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block'>
								Step-04
							</div>
							<h4 className='text-lg font-semibold mb-2'>Win Auction</h4>
							<p className='text-muted-foreground text-sm'>
								Congratulations! Collect your winning item and enjoy your
								purchase.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HowItWorksSection;
