const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/envoyerFormulaire', (req, res) => {
    res.status(405).send('Cette ressource ne peut être accédée qu\'en utilisant la méthode POST.');
});

app.post('/envoyerFormulaire', async (req, res) => {
    const webhookUrl = 'https://teolia.webhook.office.com/webhookb2/b0f16287-3172-4f73-81db-2856ea4b6839@c6cc03ce-c0c9-4397-a535-2a67c8d16335/IncomingWebhook/a01ca56f3d0d4f109930fa88c3824b49/e42641d0-da97-40e6-a3e1-4bff608bac99'; // URL de la webhook
    const formData = req.body;

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la requête: ${response.status} ${response.statusText}`);
        }

        let responseData;
        try {
            responseData = await response.json();
            console.log('Réponse JSON analysée avec succès:', responseData);
            res.json(responseData);
        } catch (jsonError) {
            console.error('Erreur lors de l\'analyse JSON de la réponse:', jsonError);
            // Si la réponse n'est pas un JSON valide, envoyer la réponse en tant que texte
            const textResponse = await response.text();
            console.error('Réponse du serveur:', response.status, textResponse);
            res.send(textResponse);
        }
    } catch (error) {
        console.error('Erreur lors de la requête:', error.message);
        res.status(500).json({ error: 'Erreur lors de la requête' });
    }

});

app.listen(port, () => {
    console.log(`Serveur écoutant sur le port ${port}`);
});
