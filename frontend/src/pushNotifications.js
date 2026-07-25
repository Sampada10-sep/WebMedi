const API_URL = "https://medireminder-backend-un9x.onrender.com";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported.");
  }

  if (!("PushManager" in window)) {
    throw new Error("Push notifications not supported.");
  }

  const registration =
    await navigator.serviceWorker.ready;

  const keyResponse = await fetch(
    `${API_URL}/api/push/public-key`
  );

  const keyData = await keyResponse.json();

  if (!keyResponse.ok) {
    throw new Error(
      keyData.message ||
        "Could not get VAPID public key."
    );
  }

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(
            keyData.publicKey
          ),
      });
  }

  const userId =
    localStorage.getItem("user_id");

  const response = await fetch(
    `${API_URL}/api/push/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        userId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save push subscription."
    );
  }

  return subscription;
}

export async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration =
    await navigator.serviceWorker.ready;

  const subscription =
    await registration.pushManager.getSubscription();

  const userId =
    localStorage.getItem("user_id");

  if (subscription) {
    await fetch(
      `${API_URL}/api/push/unsubscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          userId,
        }),
      }
    );

    await subscription.unsubscribe();
  }
}

export async function sendTestPush() {
  const userId =
    localStorage.getItem("user_id");

  const response = await fetch(
    `${API_URL}/api/push/test`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to send test push."
    );
  }

  return data;
}