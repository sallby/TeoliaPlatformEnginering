const { app } = require("@azure/functions");
const sgMail = require('@sendgrid/mail');

async function sendmail3(req, context) {
    context.res = {
        headers: {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Set-Cookie",
            "Access-Control-Max-Age": "86400",
            "Vary": "Accept-Encoding, Origin",
            "Content-Type": "application/json"
        },
    };

    const data = await req.json();

    if (!data || !data.email) {
        context.res = {
            status: 400,
            body: "Les données de la requête sont invalides. L'email est requis."
        };
        return;
    }

    const lien = data.nomRessource ? `https://portal.azure.com/?quickstart=true#@teolia.fr/resource/subscriptions/319819ff-ed9b-4c33-a3d3-d7833a1a5a54/resourceGroups/${data.nomRessource}/overview` : '';
    const messageContent = `Bonjour ${data.prenom || ''}, Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.`;
    const messageContent2 = `Bonjour ${data.prenom || ''}, Votre demande est acceptée. Voici le lien vers le groupe de ressources :  ${lien}`;
    sgMail.setApiKey(process.env.SendGridApiKey);

    const msg = {
        to: data.email,
        from: 'djiby-oumar.sall@teolia.fr',
        subject: 'Demande refusée',
        html: messageContent
    };

    const msg2 = {
        to: data.email,
        from: 'djiby-oumar.sall@teolia.fr',
        subject: 'Demande acceptée',
        html: messageContent2
    };

    try {
        if (data.nomRessource) {
            await sgMail.send(msg2);
        } else {
            await sgMail.send(msg);
        }
        context.res = {
            status: 200,
            body: "Email envoyé avec succès!"
        };
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        context.res = {
            status: 500,
            body: "Une erreur est survenue lors de l'envoi de l'email."
        };
    }
}

app.http('sendmail3', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: sendmail3
});

module.exports = sendmail3;
