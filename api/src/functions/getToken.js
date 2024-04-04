const { app } = require("@azure/functions");
const axios = require('axios'); // Utilisez 'axios' au lieu de 'window.axios'

const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const tenantId = process.env.AZURE_TENANT_ID;
const subscriptionId = "319819ff-ed9b-4c33-a3d3-d7833a1a5a54";

async function getTokenFromAAD(req, context) {
    try {
        const formData = req.body; // Utilisez request.body au lieu de request.json()
        const lien = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const response = await axios.post(lien, new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://management.azure.com/.default',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;

        return {
            body: JSON.stringify({ access_token: accessToken }),
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Set-Cookie',
                'Access-Control-Max-Age': '86400',
                'Vary': 'Accept-Encoding, Origin',
            },
        };
    } catch (error) {
        console.error("Erreur lors de la récupération du jeton depuis Azure AD :", error.message);
        throw error;
    }
}

app.http('getTokenFromAAD', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: getTokenFromAAD
});

module.exports = getTokenFromAAD;
