import type { Picture as PictureData } from '../content/types';

type Props = { picture: PictureData; alt: string; sizes?: string; eager?: boolean; className?: string };

/** Static markup only. `eager` is for the one image at the top of a page. */
export function Picture({ picture: p, alt, sizes = '100vw', eager = false, className }: Props) {
  const img = (
    <img
      src={p.src}
      alt={alt}
      width={p.width}
      height={p.height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className={p.avif ? undefined : className}
    />
  );
  if (!p.avif) return img;
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={p.avif} sizes={sizes} />
      <source type="image/webp" srcSet={p.webp} sizes={sizes} />
      {img}
    </picture>
  );
}

/** A cover that can differ per theme; CSS shows the one matching html[data-theme]. */
export function Cover(props: {
  cover: PictureData;
  coverDark?: PictureData;
  alt: string;
  sizes?: string;
  eager?: boolean;
}) {
  const { cover, coverDark, ...rest } = props;
  if (!coverDark) return <Picture picture={cover} {...rest} />;
  return (
    <>
      <Picture picture={cover} {...rest} className="only-light" />
      <Picture picture={coverDark} {...rest} className="only-dark" />
    </>
  );
}
