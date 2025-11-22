# The RollingCart Shopping Flow

## How It Works

You open RollingCart and see your Shopping List: items you need to buy. This is your active list of things to get on your next trip.

## Adding Items

When you need something, you add it to your Shopping List. You have two ways:

**From the catalog**: Start typing and RollingCart suggests items from your catalog, things you've bought before or items you've set up. Select one and it's added to your list with any description already attached.

**Create new**: If the item doesn't exist in your catalog, type the name and create it. The new item is added to both your catalog (for future use) and your Shopping List.

Either way, items land in your Shopping List ready for your next trip.

## Shopping Time

You're heading to the store. Tap "Start Shopping" to begin a shopping trip. Your Shopping List shows everything you need.

As you shop, check off items you're putting in your cart. Each checked item moves from your Shopping List into your current trip. You can see them in the "In Cart" section below.

Changed your mind? Uncheck an item and it moves back to your Shopping List.

## Finishing Up

When you're done shopping, tap "Done Shopping" to finish the trip. Your checked items are saved as part of that trip's history. You can review what you bought later in Past Trips.

**Important**: Once you finish a trip, checked items are removed from your Shopping List. They're now part of your shopping history, not your active list.

If you need milk again next week, add it again from the catalog. The catalog makes this quick: just start typing and select it.

## Canceling a Trip

Started shopping but need to cancel? You have options:

- **Keep items**: Return all checked items to your Shopping List
- **Remove items**: Delete checked items entirely

Either way, the trip is canceled and you're back to your regular Shopping List.

## Continuing a Recent Trip

Finished a trip but realized you forgot something? If it's within 24 hours, you can continue that trip instead of starting a new one.

## Why This Design

RollingCart treats your Shopping List as your active needs: what you need to buy right now. Once bought, items move to history.

The catalog is your memory. It stores everything you might need to buy, with descriptions to help identify products. When you need something again, the catalog makes it instant to add back to your list.

This keeps your Shopping List clean and focused on what you actually need, while the catalog ensures you never have to remember or retype item details.

## Common Questions

**What if I need the same item regularly?** Add it from the catalog each time. The catalog remembers everything, so adding repeat items is just a quick search and tap.

**What if I don't get everything?** No problem. Unchecked items roll over to your next trip. Only checked items are removed when you finish a trip.

**Can I see what I bought before?** Yes. Past Trips shows your shopping history with all items from each trip.

**What if I want to remove something from my list?** Delete it. If you might need it again later, it's still in your catalog for easy re-adding.

## Design Philosophy

### Why One Shopping List?

Most grocery apps let you create multiple lists: one for the supermarket, one for the weekly shop, one for a party. RollingCart takes a different approach: one list, always.

**The catalog provides organization.** Categories like "Dairy", "Produce", and "Snacks" give you logical grouping without managing separate lists. Your items are organized by what they are, not where you'll buy them.

**Sessions handle timing.** Other apps use multiple lists to separate "this week" from "next week". RollingCart handles this naturally. Unchecked items roll over to your next trip. No need to maintain separate lists for different timeframes.

**One source of truth.** No more "did I put eggs on the supermarket list or the weekly list?" Everything lives in one place. When you need something, you know exactly where to look.

**Simplicity over flexibility.** Managing multiple lists adds overhead. For routine shopping (same store, similar items week to week), that overhead isn't worth it. One list means zero list management.

### What About Different Stores?

Currently, RollingCart doesn't track where you shop. It's completely store-agnostic. Your Shopping List is simply a list of what to buy, not where to buy it.

This fits how many people actually shop: you don't always decide ahead of time where you'll get each item. When you see it at whichever store you're in, you buy it. The list is about *what* you need, not *where* to get it.

**Coming soon**: Shopping trips will support place metadata, allowing you to attach a store to each trip. You'll also be able to save frequent stores for quick selection. This gives you store-specific history without the complexity of managing separate lists.

The philosophy remains: one active Shopping List, but with awareness of where you shopped.
