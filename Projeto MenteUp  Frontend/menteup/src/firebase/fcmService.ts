import { getToken } from "firebase/messaging";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase/firebaseConfig";
export async function gerarTokenFCM(): Promise<string | null> {
    try {
        console.log("1. Iniciando geração do FCM Token...");

        const permissao = await Notification.requestPermission();

        console.log("2. Permissão:", permissao);

        if (permissao !== "granted") {
            console.log("Permissão para notificações não concedida.");
            return null;
        }

        console.log("3. Registrando Service Worker...");

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );

        console.log("4. Service Worker registrado:", registration);

        console.log("5. Gerando FCM Token...");

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        console.log("6. Resultado do getToken:", token);

        if (!token) {
            console.log("Não foi possível gerar o token FCM.");
            return null;
        }

        console.log("7. FCM Token gerado com sucesso!");

        return token;

    } catch (error) {
        console.error("8. Erro ao gerar FCM Token:", error);
        return null;
    }

}

export async function registrarTokenFCM(): Promise<void> {

    try {

        console.log("Registrando FCM Token no backend...");

        const fcmToken = await gerarTokenFCM();

        if (!fcmToken) {
            console.log("FCM Token não foi gerado.");
            return;
        }

        const tokenJWT = localStorage.getItem("token");

        if (!tokenJWT) {
            console.error("JWT não encontrado.");
            return;
        }

        const resposta = await fetch(
            "http://localhost:8080/usuarios/fcm-token",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": tokenJWT
                },

                body: JSON.stringify({
                    fcmToken: fcmToken
                })
            }
        );

        if (!resposta.ok) {

            const mensagem = await resposta.text();

            throw new Error(
                `Erro ao registrar FCM Token: ${resposta.status} - ${mensagem}`
            );
        }

        console.log(
            "FCM Token registrado no backend com sucesso!"
        );

    } catch (error) {

        console.error(
            "Erro ao registrar FCM Token:",
            error
        );
    }


}
//  Receber notificações quando o MenteUp está aberto
export function ouvirNotificacoesFCM() {

    console.log("🔥 onMessage sendo configurado...");

    onMessage(messaging, (payload) => {

        console.log(
            "🔥🔥 MENSAGEM FCM RECEBIDA:",
            payload
        );

        const titulo =
            payload.notification?.title ||
            "MenteUp";

        const mensagem =
            payload.notification?.body ||
            "Você recebeu uma nova notificação.";

        console.log("Título:", titulo);
        console.log("Mensagem:", mensagem);

        if (Notification.permission === "granted") {

            console.log("🔔 Criando notificação...");

            new Notification(titulo, {
                body: mensagem,
                icon: "/favicon.ico"
            });

        } else {

            console.log(
                "⚠️ Permissão de notificação:",
                Notification.permission
            );
        }
    });
}