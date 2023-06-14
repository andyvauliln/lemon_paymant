"use client";
import { Paylink, PaymentRequestType } from "@heliofi/common";
import { HelioPay } from "@heliofi/react";
import { ClusterType, HelioSDK } from "@heliofi/sdk";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Cluster } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { axios } from "~/lib/axios";
import { useAuth } from "~/providers/auth";
import { CreateCheckoutResponse } from "./api/payment/subscribe/route";

export default function LemonSubscribeButton() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const defaultPaymentRequestId = '6489ee380e7eca35b0f31188';
  const [paymentRequestId, setPaymentRequestId] = useState<string>(defaultPaymentRequestId);
  const [cluster, setCluster] = useState<Cluster>(ClusterType.Mainnet);
  const [paymentType, setPaymentType] = useState<PaymentRequestType>(PaymentRequestType.PAYLINK);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [paymentRequest, setPaymentRequest] = useState<Paylink | null>(null);
  const [isShownCustom, setIsShownCustom] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchPaylink = async () => {
      if (paymentType === PaymentRequestType.PAYLINK && paymentRequestId) {
        const paylink = await sdk.apiService.getPaymentRequestByIdPublic(paymentRequestId, paymentType);
        setPaymentRequest(paylink as Paylink);
      } else {
        setPaymentRequest(null);
      }
    }
    fetchPaylink();

  }, [paymentRequestId, paymentType])

  if (!isAuthenticated || !user) return <></>;



  const handleClick = async () => {
    try {
      const { checkoutURL } = await axios.post<any, CreateCheckoutResponse>(
        "/api/payment/subscribe",
        { userId: user.id }
      );
      window.location.href = checkoutURL;
    } catch (err) {
      //
    }
  };

  return

  <>
    {!isSuccess && (
      <>
        <div >
          Choose an example
        </div>

        <select
          defaultValue={paymentRequestId}
          onChange={(e) => {
            setIsShownCustom(!e.target.value);
            setPaymentRequestId(e.target.value);
            setCluster(e.target[e.target.selectedIndex].getAttribute('data-cluster') as Cluster);
            setPaymentType(e.target[e.target.selectedIndex].getAttribute('data-payment-type') as PaymentRequestType);
          }}
        >
          <option value="" disabled>
            Select one...
          </option>
          <option
            value={defaultPaymentRequestId}
            data-payment-type={PaymentRequestType.PAYLINK}
            data-cluster={ClusterType.Mainnet}
          >
            Coffee order (mainnet Pay Link)
          </option>
          <option
            value={defaultPaymentRequestId}
            data-payment-type={PaymentRequestType.PAYLINK}
            data-cluster={ClusterType.Devnet}
          >
            Coffee order (devnet Pay Link)
          </option>
          <option
            value={defaultPaymentRequestId}
            data-payment-type={PaymentRequestType.PAYSTREAM}
            data-cluster={ClusterType.Mainnet}
          >
            Coffee order (mainnet Pay Stream)
          </option>
          <option
            value={defaultPaymentRequestId}
            data-payment-type={PaymentRequestType.PAYSTREAM}
            data-cluster={ClusterType.Devnet}
          >
            Coffee order (devnet Pay Stream)
          </option>
          <option
            value={''}
            data-payment-type={PaymentRequestType.PAYLINK}
            data-cluster={ClusterType.Mainnet}
          >
            Custom
          </option>
        </select>
        {isShownCustom && <>
          <div data-tooltip={'Log in to hel.io and create a Pay Link or ' +
            '"Dynamic payment". Copy paste the paymentRequestId  from Step 4: Integrate Helio'}>
            Paste you payment ID here to test your checkout
          </div>
          <input
            type="text"
            value={paymentRequestId}
            onChange={(e) => setPaymentRequestId(e.target.value)}
          />
          <br />
          <br />
          <div>
            <label>
              <input
                type="radio"
                name="cluster"
                value={ClusterType.Mainnet}
                checked={cluster === ClusterType.Mainnet}
                onChange={() => setCluster(ClusterType.Mainnet)}
              />
              &nbsp; mainnet-beta
            </label>
            &nbsp;&nbsp;&nbsp;
            <label>
              <input
                type="radio"
                name="cluster"
                value={ClusterType.Devnet}
                checked={cluster === ClusterType.Devnet}
                onChange={() => setCluster(ClusterType.Devnet)}
              />
              &nbsp; devnet
            </label>
          </div>
          <br />
          <br />
          <div>
            <label title={'1-time payment'}>
              <input
                type="radio"
                name="requestType"
                value={PaymentRequestType.PAYLINK}
                checked={paymentType === PaymentRequestType.PAYLINK}
                onChange={() => setPaymentType(PaymentRequestType.PAYLINK)}
              />
              &nbsp; Pay Link
            </label>
            &nbsp;&nbsp;&nbsp;
            <label title={'Recurring payment'}>
              <input
                type="radio"
                name="requestType"
                value={PaymentRequestType.PAYSTREAM}
                checked={paymentType === PaymentRequestType.PAYSTREAM}
                onChange={() => setPaymentType(PaymentRequestType.PAYSTREAM)}
              />
              &nbsp; Pay Stream
            </label>
          </div>
          <br />
          <br />
        </>}
      </>
    )}
    <HelioPay
      cluster={cluster}
      payButtonTitle="Buy Coffee"
      paymentRequestId={paymentRequestId}
      onSuccess={function (event): void {
        console.log("onSuccess", event);
        setIsSuccess(true);
      }}
      onError={function (event): void {
        console.log("onError", event);
        setIsSuccess(false);
      }}
      onPending={function (event): void {
        console.log("onPending", event);
      }}
      onStartPayment={function (): void {
        console.log("onStartPayment");
      }}
      supportedCurrencies={['USDC']}
      totalAmount={paymentRequest?.dynamic ? 0.01 : undefined}
      paymentType={paymentType}

    />;
  </>

}
