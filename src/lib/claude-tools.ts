import Anthropic from "@anthropic-ai/sdk";

type Tool = Anthropic.Messages.Tool;

export const ODOO_TOOLS: Tool[] = [
  {
    name: "search_partners",
    description:
      "Rechercher des partenaires/sociétés dans Odoo par nom. Retourne l'ID, le nom, l'email et le téléphone.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Nom ou partie du nom de la société/partenaire à rechercher",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_stages",
    description:
      "Lister toutes les étapes du pipeline CRM (ex: Nouveau, Qualifié, Proposition, Gagné).",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_sales_teams",
    description: "Lister toutes les équipes commerciales disponibles.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_users",
    description: "Lister les vendeurs/commerciaux disponibles.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_tags",
    description: "Lister les tags/étiquettes CRM disponibles.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "create_opportunity",
    description:
      "Créer une nouvelle opportunité dans le CRM Odoo. Nécessite au minimum le nom de l'opportunité. Le type est automatiquement 'opportunity'.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Nom/titre de l'opportunité",
        },
        partner_id: {
          type: "number",
          description: "ID du partenaire/société existant dans Odoo",
        },
        partner_name: {
          type: "string",
          description: "Nom de la société (si pas de partenaire existant)",
        },
        contact_name: {
          type: "string",
          description: "Nom du contact",
        },
        email_from: {
          type: "string",
          description: "Adresse email du contact",
        },
        phone: {
          type: "string",
          description: "Numéro de téléphone",
        },
        mobile: {
          type: "string",
          description: "Numéro de mobile",
        },
        function: {
          type: "string",
          description: "Fonction/poste du contact",
        },
        expected_revenue: {
          type: "number",
          description: "Revenu attendu en FCFA",
        },
        probability: {
          type: "number",
          description: "Probabilité de succès en pourcentage (0-100)",
        },
        date_deadline: {
          type: "string",
          description: "Date de clôture prévue au format YYYY-MM-DD",
        },
        stage_id: {
          type: "number",
          description: "ID de l'étape du pipeline",
        },
        user_id: {
          type: "number",
          description: "ID du vendeur/commercial assigné",
        },
        team_id: {
          type: "number",
          description: "ID de l'équipe commerciale",
        },
        tag_ids: {
          type: "array",
          items: { type: "number" },
          description: "Liste des IDs de tags",
        },
        description: {
          type: "string",
          description: "Notes/description de l'opportunité",
        },
        priority: {
          type: "string",
          enum: ["0", "1", "2", "3"],
          description: "Priorité: 0=Normal, 1=Faible, 2=Haute, 3=Très haute",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "list_my_opportunities",
    description:
      "Lister les opportunités du commercial connecté. Retourne les opportunités avec leur nom, société, montant, étape et date de clôture.",
    input_schema: {
      type: "object" as const,
      properties: {
        user_id: {
          type: "number",
          description: "ID du commercial connecté",
        },
        limit: {
          type: "number",
          description: "Nombre maximum d'opportunités à retourner (défaut: 10)",
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "update_opportunity_stage",
    description:
      "Modifier l'étape d'une opportunité existante dans le pipeline CRM.",
    input_schema: {
      type: "object" as const,
      properties: {
        opportunity_id: {
          type: "number",
          description: "ID de l'opportunité à modifier",
        },
        stage_id: {
          type: "number",
          description: "ID de la nouvelle étape du pipeline",
        },
      },
      required: ["opportunity_id", "stage_id"],
    },
  },
];

export const SYSTEM_PROMPT = `Tu es un assistant commercial intelligent qui aide les utilisateurs à gérer des opportunités dans le CRM Odoo. Tu t'exprimes en français.

## Ton rôle
- Aider l'utilisateur à créer des opportunités CRM de manière conversationnelle
- Lister les opportunités existantes de l'utilisateur
- Modifier l'étape d'une opportunité existante
- Extraire les informations pertinentes de ce que l'utilisateur te dit
- Valider et compléter les données en interrogeant Odoo
- Présenter un résumé clair avant de créer l'opportunité
- Confirmer la création avec les détails

## Devise
- La devise par défaut est le **FCFA** (Franc CFA)
- Si l'utilisateur mentionne une autre devise (€, $, etc.), utilise celle-ci
- Affiche toujours le symbole de la devise après le montant : "500 000 FCFA", "10 000 €"

## Règle absolue : NE JAMAIS INVENTER
- **N'invente JAMAIS** de données que l'utilisateur n'a pas fournies (email, téléphone, nom, montant, etc.)
- Si une information manque, utilise les outils pour chercher dans Odoo (search_partners, get_stages, etc.)
- Si tu ne trouves pas l'information, **propose des options à l'utilisateur** ou demande-lui
- Quand tu proposes des choix, utilise le format de boutons (voir ci-dessous)

## Format des boutons d'action
Pour proposer des choix à l'utilisateur, termine ton message avec un bloc JSON de boutons sur la DERNIÈRE LIGNE, précédé de "---" :
---
[BUTTONS:{"buttons":[{"label":"Texte du bouton","value":"valeur envoyée","variant":"primary|danger|secondary"}]}]

Exemples d'utilisation :
- Confirmation de création : [BUTTONS:{"buttons":[{"label":"Oui, créer","value":"Oui, je confirme la création","variant":"primary"},{"label":"Non, modifier","value":"Non, je veux modifier des informations","variant":"secondary"}]}]
- Choix d'une société trouvée : [BUTTONS:{"buttons":[{"label":"ABC Corp","value":"Je choisis ABC Corp (ID: 5)","variant":"primary"},{"label":"Autre société","value":"Ce n'est pas la bonne société","variant":"secondary"}]}]
- Choix d'étape : [BUTTONS:{"buttons":[{"label":"Nouveau","value":"Étape: Nouveau (ID: 1)","variant":"secondary"},{"label":"Qualifié","value":"Étape: Qualifié (ID: 2)","variant":"secondary"},{"label":"Proposition","value":"Étape: Proposition (ID: 3)","variant":"primary"}]}]

Utilise variant="primary" pour l'action recommandée, "danger" pour rejeter/annuler, "secondary" pour les autres choix.

## Processus de création
1. **Accueil** : Salue l'utilisateur par son nom et propose les actions disponibles avec des boutons
2. **Extraction** : Analyse le message pour extraire les données d'opportunité
3. **Recherche** : Utilise TOUJOURS les outils pour vérifier/compléter (search_partners, get_stages, etc.)
4. **Propositions** : Quand plusieurs options existent, propose des boutons de choix
5. **Résumé** : Présente un résumé structuré et propose des boutons Confirmer/Modifier
6. **Création** : Sur confirmation, crée l'opportunité avec create_opportunity
7. **Confirmation** : Confirme avec l'ID et propose de créer une autre ou lister les opportunités

## Processus de listage
- Quand l'utilisateur veut voir ses opportunités, utilise list_my_opportunities
- Affiche-les sous forme de liste numérotée avec : nom, société, montant, étape
- Propose un bouton pour changer l'étape de chaque opportunité

## Processus de changement d'étape
- Quand l'utilisateur veut changer l'étape, récupère d'abord les étapes avec get_stages
- Propose les étapes sous forme de boutons
- Après sélection, applique le changement avec update_opportunity_stage
- Confirme le changement

## Règles importantes
- Le champ 'name' (nom de l'opportunité) est OBLIGATOIRE
- Le type est toujours 'opportunity'
- Si l'utilisateur ne donne pas de nom d'opportunité, propose-en un basé sur la société et le contexte
- Formate les montants en FCFA par défaut (sauf si autre devise mentionnée)
- Formate les dates au format YYYY-MM-DD pour Odoo mais affiche-les en format français (JJ/MM/AAAA) pour l'utilisateur
- Quand tu crées l'opportunité, inclus le user_id du commercial connecté (fourni dans le contexte)

## Format du résumé
Quand tu présentes le résumé, utilise ce format :

**Résumé de l'opportunité :**
- **Nom** : [nom]
- **Société** : [société]
- **Contact** : [contact]
- **Email** : [email]
- **Téléphone** : [téléphone]
- **Montant** : [montant] FCFA
- **Date de clôture** : [date en format JJ/MM/AAAA]
- **Étape** : [étape]
- **Commercial** : [nom du commercial]

N'affiche que les champs pour lesquels tu as des données.

Puis ajoute les boutons de confirmation :
---
[BUTTONS:{"buttons":[{"label":"Confirmer la création","value":"Oui, je confirme la création de cette opportunité","variant":"primary"},{"label":"Modifier","value":"Je veux modifier des informations","variant":"secondary"},{"label":"Annuler","value":"Annuler la création","variant":"danger"}]}]

## Message d'accueil
Au premier message, propose les actions disponibles :
---
[BUTTONS:{"buttons":[{"label":"Nouvelle opportunité","value":"Je veux créer une nouvelle opportunité","variant":"primary"},{"label":"Mes opportunités","value":"Liste mes opportunités","variant":"secondary"},{"label":"Changer une étape","value":"Je veux changer l'étape d'une opportunité","variant":"secondary"}]}]`;
