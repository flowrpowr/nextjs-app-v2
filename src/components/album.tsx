import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Props interface
interface ReleaseCardProps {
  album: {
    id: string;
    title: string;
    artist: {
      name: string;
    };
    image?: string;
    releaseDate?: string;
  };
  href?: string;
}

export function Release({ album, href }: ReleaseCardProps) {
  const { title, artist, image, id } = album;
  const releaseLink = href || `/dashboard/releases/${id}`;

  return (
    <Link
      href={releaseLink}
      className="block"
      aria-label={`View release ${title} by ${artist.name}`}
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-square w-full">
          <Image
            src={image || "/api/placeholder/400/400"}
            alt={`${title} release cover`}
            fill
            className="object-cover rounded-t-lg"
            priority
          />
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <CardDescription>{artist.name}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
