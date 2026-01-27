import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ReturnButton } from "@/components/ReturnButton";
import { SignOutButton } from "@/components/SignoutButton";
import { Button } from "@/components/ui/button";
import { UpdateUserForm } from "@/components/UpdateUserForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SellerProfile() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) redirect("/sign-in");

  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        posts: ["update", "delete"],
      },
    },
  });

  return (
    <div className="container mx-auto max-w-5xl">
     
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt="User Image"
          className="size-12 border border-primary rounded-md object-cover"
        />
      ) : (
        <div className="size-32 border border-primary rounded-md bg-primary text-primary-foreground flex items-center justify-center">
          <span className="uppercase text-lg font-bold">
            {session.user.name.slice(0, 2)}
          </span>
        </div>
      )}

      <pre className="text-sm overflow-clip">
        {JSON.stringify(session, null, 2)}
      </pre>

     
    </div>
  );
}