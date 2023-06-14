
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "reflect-metadata";
import { getUserSubscriptionPlan } from "~/lib/subscription";
// import HelioSubscribeButton from "./HelioSubscribeButton";
import LemonSubscribeButton from "./LemonSubscribeButton";
import ManageSubscription from "./ManageSubscription";

export default async function Home() {
  const cookiesList = cookies();
  const userId = cookiesList.get("userId")?.value || "";

  if (!userId) return redirect("/login");

  const { isPro, isCanceled, currentPeriodEnd, updatePaymentMethodURL } =
    await getUserSubscriptionPlan(userId);

  return (
    <div className="w-full max-w-md bg-white/5 border border-gray-900 p-8 rounded-lg">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Your profile</h2>
        {isPro ? (
          <ManageSubscription
            userId={userId}
            isCanceled={isCanceled}
            currentPeriodEnd={currentPeriodEnd}
            updatePaymentMethodURL={updatePaymentMethodURL}
          />
        ) : (
            <>
              <LemonSubscribeButton />
              {/* <HelioSubscribeButton /> */}

            </>
        )}
      </div>
    </div>
  );
}
