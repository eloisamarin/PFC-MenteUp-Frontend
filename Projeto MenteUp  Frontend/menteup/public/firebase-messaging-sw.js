importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "apiKey",
    authDomain: "authDomain",
    projectId: "projectId",
    storageBucket: "storageBucket",
    messagingSenderId: "messagingSenderId",
    appId: "appId",
    measurementId: "measurementId"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Mensagem recebida:",
        payload
    );
    const notificationTitle =
        payload.notification?.title || "MenteUp";

    const notificationOptions = {
        body:
            payload.notification?.body ||
            "Você recebeu uma nova notificação.",
        data: payload.data || {}
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
    self.addEventListener("notificationclick", (event) => {
        console.log("Notificação clicada!");

        event.notification.close();

        const url = "/aluno/atividades";

        event.waitUntil(
            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then((clientList) => {

                // Procura uma aba do MenteUp já aberta
                for (const client of clientList) {

                    if ("focus" in client) {
                        return client.focus().then(() => {
                            return client.navigate(url);
                        });
                    }
                }

                // Se não encontrar nenhuma aba, abre uma nova
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    });
});