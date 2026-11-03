---
name: juges
description: >
  Panel de 3 juges — des devs seniors du domaine du projet, avec 3 personnalités
  (l'Optimiste, le Sceptique, le Pragmatique) — qui débattent ensemble jusqu'à
  désigner à l'unanimité la meilleure formule complète : architecture et
  infrastructure, fonctionnement, efficacité et expérience. Use when the user
  asks for "juges", "3 juges", "panel", "jury", "faites débattre", "débat",
  "consensus", "unanimité", "quelle est la meilleure formule", "valider une
  architecture", or wants a project, site, app or refonte decided by debate
  instead of separate audits.
---

# Les 3 juges — débat jusqu'au consensus

Trois juges débattent **ensemble** de tout le projet et s'accordent **à l'unanimité**
sur **une** formule gagnante. Ce n'est PAS trois audits séparés qui chassent des bugs
chacun dans leur coin : le débat porte sur la formule, les bugs sont secondaires.

## 1. Le panel

- **Même métier pour les trois** : des devs seniors spécialisés dans le domaine
  **du projet** (paramètre à fixer à chaque fois : fintech et crédit, hôtellerie,
  SaaS immobilier, e-commerce…). Jamais trois spécialistes de domaines différents
  (design / métier / technique) : ils ne peuvent pas débattre d'une formule globale.
- **Trois personnalités** :
  | Juge | Rôle dans le débat |
  |---|---|
  | **L'Optimiste** (bâtisseur) | Pousse l'ambition, propose ce qui ferait la différence, défend l'expérience. |
  | **Le Sceptique** (avocat du diable) | Cherche ce qui casse, ce qui coûte, ce qui ne sera jamais utilisé. |
  | **Le Pragmatique** (arbitre sur preuves) | Tranche sur les faits : données, code, délais, coût, ce qui se mesure. |

## 2. Les 4 axes obligatoires (même poids)

1. **Architecture** — y compris l'infrastructure (hébergement, données, intégrations).
2. **Fonctionnement** — ce que fait le produit, parcours, règles métier.
3. **Efficacité** — performance, coût, maintenance, résultat business.
4. **Expérience** — ergonomie, visuel, utilisation, présentation.

L'expérience pèse autant que le reste : un débat qui ne parle que de tuyauterie est raté.
Chaque page ou écran proposé est décrit **concrètement** : premier écran, schéma
ordinateur ET téléphone, gestes (clic, scroll, swipe, saisie).

## 3. Déroulé

**Tour 0 — Cadre (le modérateur, c'est toi)**
Écrire le brief commun : projet, objectif, public, contraintes, domaine des juges,
et les sources réelles à lire (code, site en ligne, captures, données). Les juges
lisent le vrai matériau avant de parler, jamais de supposition.

**Tour 1 — Positions**
Chaque juge écrit sa position complète sur les 4 axes et **sa formule idéale complète**.

**Tours suivants — Débat**
- Chaque juge lit les positions des deux autres, répond point par point et révise la sienne.
- Chaque juge **vote** pour une formule (la sienne ou celle d'un autre), avec justification.
  Les amendements sont permis : « je vote B si on remplace X par Y ».
- Entre deux tours, le modérateur liste les désaccords restants, sans trancher lui-même.

**Fin — Un gagnant par choix unanime**
- On s'arrête quand les trois votent pour **la même formule** (amendée si besoin).
- **Pas de synthèse fusionnée** : les formules sont en compétition, une seule gagne.
- Un seul **document de consensus**, approuvé explicitement par les trois juges.
- Garde-fou : sans unanimité après 4 tours, présenter à l'utilisateur les formules
  restantes et les points de blocage, et le laisser trancher.

**Après le débat**
1. Présenter le document de consensus à l'utilisateur.
2. Appliquer la formule (seulement maintenant).
3. Les trois juges valident **ensemble** le résultat appliqué.

## 4. Mise en œuvre avec des sous-agents

- Un sous-agent par juge, même modèle, avec un prompt de persona (ci-dessous).
- Garder le contexte de chaque juge d'un tour à l'autre (continuer le même agent
  plutôt que d'en relancer un neuf), et lui transmettre les positions des deux autres.
- Écrire tout le débat dans un fichier du projet, par exemple
  `docs/juges/AAAA-MM-JJ-<sujet>.md` : brief, tours, votes, document de consensus.

Prompt de persona (à adapter) :

```
Tu es <l'Optimiste | le Sceptique | le Pragmatique>, dev senior spécialisé en
<domaine du projet>, membre d'un panel de 3 juges.
Mission : désigner avec les deux autres, à l'unanimité, la meilleure formule complète
pour <projet> sur 4 axes de même poids : architecture (+ infra), fonctionnement,
efficacité, expérience (ergonomie, visuel, utilisation, présentation).
Lis d'abord les sources : <chemins, URL, captures, données>.
Tour 1 : écris ta position complète et ta formule idéale. Décris chaque écran
concrètement (premier écran, ordinateur et téléphone, gestes).
Tours suivants : réponds point par point aux autres, révise ta formule, vote pour
une formule avec justification, propose des amendements si besoin.
Ta personnalité : <bâtisseur ambitieux | avocat du diable | arbitre sur preuves>.
Pas de chasse aux bugs : on débat de la formule.
```

## 5. Erreurs à éviter

- Trois audits indépendants avec des verdicts séparés.
- Trois spécialistes de domaines différents au lieu de trois devs du domaine du projet.
- Oublier l'axe expérience.
- Fusionner les formules en une synthèse molle au lieu d'élire un gagnant.
- Appliquer quoi que ce soit avant le document de consensus.
