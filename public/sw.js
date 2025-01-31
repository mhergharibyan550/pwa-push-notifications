self.addEventListener("push", (e) => {
  if (e.data) {
    const data = e.data.json();
    const options = {
      body: data.body,
      icon: data.icon,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 2,
      },
    };
    e.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationClick", (e) => {
  console.log("Notification clicked!");
  e.notification.close();
  e.waitUntil(clients.openWindow("https://localhost:3000"));
});
