export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  return width <= 400
    ? src.replace(".webp", "-400.webp")
    : width <= 800
      ? src.replace(".webp", "-800.webp")
      : `${src}?w=${width}`;
}
