# Photo Library

An infinite, random photostream with a favorites library, built with Angular 22 and Angular Material.

- **Photos** (`/`): an infinitely scrolling grid of random photos. Click a photo to add it to your favorites.
- **Favorites** (`/favorites`): the photos you saved. They persist after a page refresh. Click one to open it.
- **Photo** (`/photos/:id`): one large photo with a "Remove from favorites" button.

## Running it

Angular 22 needs Node.js 22.22.3 or newer in the 22 line, 24.15 or newer in the 24 line, or 26+.

```bash
npm install
npm start        # dev server on http://localhost:4200
npm test         # unit tests (Vitest)
npm run build    # production build in dist/
```

## How it works

**Random photos.** Photos come from the [picsum.photos](https://picsum.photos) list API. That list is a fixed catalog of 993 photos that always comes back in the same order, so the randomness is done in the app: the 33 full pages of 30 photos are visited in a shuffled order, and the order is reshuffled every time the Photos page opens. Each page is shown exactly once, so no photo repeats. Loading a page has a random 200-300 ms delay to behave like a real API.

**Infinite scroll.** A small directive (`appInfiniteScroll`) wraps an `IntersectionObserver` on a sentinel element below the grid. No libraries. The sentinel is replaced by a loader while a page loads, and by a "No more photos to load" message after the last page.

**Favorites.** Only photo ids are stored, in `localStorage`, and image URLs are built from the id. The state lives in a signal, and a `storage` listener keeps other open tabs in sync.

**No backend.** Everything runs in the browser.

## Code layout

```
src/app/
  header/              sticky header with the two navigation buttons
  pages/               photos, favorites, photo-detail, not-found (lazy loaded)
  shared/components/   photo-card, photos-grid
  shared/directives/   infinite-scroll
  shared/utils/        shuffle
  services/            photos-api, favorites, storage
  models/              photo model
```

Components are standalone, use `OnPush` change detection, and the app runs zoneless. Tests sit next to the code they test.

## Upgrade history

The starter was an Angular 16 project. The git history upgrades it one major version at a time (16 → 22), with one commit per version, before the app itself is built.
