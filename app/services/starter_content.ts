/**
 * Content proposed to a new campaign or template, to show the editor
 * features and the personalisation tags.
 */
export const STARTER_BODY = `<h1>Bonjour {{ first_name | "à vous" }},</h1>
<p>Écrivez ici le message de votre campagne. Les variables comme <strong>{{ first_name }}</strong> ou <strong>{{ company }}</strong> sont remplacées par les informations de chaque contact.</p>
<p>Ajoutez des titres, des listes, des images et des liens avec la barre d'outils.</p>
<p><a href="https://example.com">Découvrir l'offre</a></p>
<p>À bientôt,<br>L'équipe</p>`
