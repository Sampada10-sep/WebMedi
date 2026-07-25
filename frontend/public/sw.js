self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "💊 Medicine Reminder",
    body: "It is time to take your medicine.",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/medicine-icon.png",
    badge: "/medicine-icon.png",
    tag: data.tag || "medicine-reminder",
    requireInteraction: true,
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "💊 Medicine Reminder",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || "/";

  event.waitUntil(
  self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return self.clients.openWindow(url);
    })
  );
});