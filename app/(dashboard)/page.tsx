import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      Hi there
      <UserButton afterSignOutUrl="/"/>
    </div>
  );
}
