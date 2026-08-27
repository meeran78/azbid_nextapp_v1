import Link from 'next/link';
import { Store } from 'lucide-react';
import { LotItemCard } from '@/app/stores/[storeId]/LotItemCard';
import type { ActiveItem } from '@/actions/active-lots.action';

export function ActiveItemCard({
	item,
	isFavourited,
	isWatched,
}: {
	item: ActiveItem;
	isFavourited: boolean;
	isWatched: boolean;
}) {
	return (
		<div className='relative pt-4'>
			<Link
				href={`/stores/${item.storeId}`}
				className='group absolute -top-1 left-3 z-10 inline-flex min-w-0 max-w-[calc(100%-1.5rem)]'>
				<div className='animate-fade-in inline-flex items-center gap-1.5 truncate whitespace-nowrap rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-foreground shadow-md ring-1 ring-border transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary group-hover:shadow-lg'>
					<Store className='h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-rotate-12' />
					<span className="truncate">{item.storeName}</span>
				</div>
			</Link>
			<LotItemCard
				item={item}
				lotId={item.lotId}
				lotStatus={item.lotStatus}
        lotDisplayId={item.lotDisplayId}
				auctionEndAt={item.lotAuctionEndAt}
				storeId={item.storeId}
				isFavourited={isFavourited}
				isWatched={isWatched}
			/>
		</div>
	);
}
