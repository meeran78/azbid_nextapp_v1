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
		<div className='space-y-2'>
			<div className='flex items-center justify-between gap-2 px-1 text-sm'>
				<Link
					href={`/stores/${item.storeId}`}
					className='flex min-w-0 items-center gap-1.5 truncate font-medium text-muted-foreground transition-colors hover:text-foreground'>
					<div className='inline-block rounded-full bg-muted px-6 py-1 text-xs font-medium text-foreground whitespace-nowrap'>
						<Store className='h-3.5 w-3.5 shrink-0' />
						<span>{item.storeName}</span>
					</div>
				</Link>
			</div>
			<LotItemCard
				item={item}
				lotId={item.lotId}
				lotStatus={item.lotStatus}
				auctionEndAt={item.lotAuctionEndAt}
				storeId={item.storeId}
				isFavourited={isFavourited}
				isWatched={isWatched}
			/>
		</div>
	);
}
