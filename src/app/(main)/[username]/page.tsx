import UserDetails from "./UserDetails";

interface UserDetailsProps {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: UserDetailsProps) {
  const { username } = await params;

  return (
    <div className="w-full">
      <UserDetails username={username} />
    </div>
  );
}
