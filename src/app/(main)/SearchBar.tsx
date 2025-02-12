import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function SearchBar() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const q = (target.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Input type="text" placeholder="Search" name="q" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}
