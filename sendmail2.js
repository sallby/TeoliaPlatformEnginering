const { app } = require("@azure/functions");
const fetch = require('node-fetch');
const msal = require('@azure/msal-node');

// ID client et secret client du service principal
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

// Créez une configuration pour MSAL
const config = {
    auth: {
        clientId: clientId,
        authority: "https://login.microsoftonline.com/c6cc03ce-c0c9-4397-a535-2a67c8d16335",
        clientSecret: clientSecret
    }
};

// Créez une nouvelle instance de client
const cca = new msal.ConfidentialClientApplication(config);

async function sendmail(req, context) {
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
    const clientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"], // scopes indiquent les ressources auxquelles l'application demande l'accès
    };

    const data = req.body;

    const messageContent = `Bonjour ${data.prenom || ''}, Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.`;

    try {
        const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
        const token_access = response.accessToken;

        // Envoyez une requête à l'API Microsoft Graph en utilisant le jeton d'accès
        const responseMail = await fetch(`https://graph.microsoft.com/v1.0/me/sendMail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token_access}`,
            },
            body: JSON.stringify({
                message: {
                    subject: 'Demande refusée',
                    body: {
                        contentType: 'Text',
                        content: messageContent
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: data.email
                            }
                        }
                    ]
                },
                saveToSentItems: 'false'
            }),
        });

        if (!responseMail.ok) {
            throw new Error(`Erreur lors de la requête: ${responseMail.status} ${responseMail.statusText}`);
        }

        context.res = {
            body: 'Mail envoyé avec succès.',
        };
    } catch (error) {
        console.log(error);
        context.res = {
            status: 500,
            body: 'Une erreur est survenue lors de l\'envoi du mail.',
        };
    }
}
app.http('sendmail', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: sendmail
});

module.exports = sendmail;