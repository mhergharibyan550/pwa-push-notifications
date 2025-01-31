import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";
import { urlBase64ToUint8Array } from "@/utils";
import { useEffect, useState } from "react";

const PushNotificationManager = () => {
  const [message, setMessage] = useState<string>("");
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    console.log("SUB:", sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-600">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Push Notifications
      </h3>
      {subscription ? (
        <>
          <p className="text-gray-700 mb-4">
            You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="w-full py-2 px-4 mb-4 text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
          >
            Unsubscribe
          </button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={sendTestNotification}
            className="w-full py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Send Test
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 mb-4">
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className="w-full py-2 px-4 text-white bg-green-500 hover:bg-green-600 rounded-lg transition"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
};
export default PushNotificationManager;
