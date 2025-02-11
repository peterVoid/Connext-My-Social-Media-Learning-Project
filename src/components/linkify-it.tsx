import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

interface linkifyItProps {
  children: React.ReactNode;
}

export default function LinkifyIt({ children }: linkifyItProps) {
  return (
    <LinkItUrl className="text-blue-500 hover:underline">
      <LinkIt
        regex={/(@[a-zA-Z0-9_-]+)/}
        component={(match, key) => (
          <Link
            key={key}
            href={`/${match}`}
            className="text-blue-500 hover:underline"
          >
            {match}
          </Link>
        )}
      >
        <LinkIt
          regex={/(#[a-zA-Z0-9_-]+)/}
          component={(match, key) => (
            <Link
              key={key}
              href={`/hashtag/${match.slice(1)}`}
              className="text-blue-500 hover:underline"
            >
              {match}
            </Link>
          )}
        >
          {children}
        </LinkIt>
      </LinkIt>
    </LinkItUrl>
  );
}
