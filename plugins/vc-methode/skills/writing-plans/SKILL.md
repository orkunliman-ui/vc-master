---
name: writing-plans

description: >
  Structured implementation planning for complex projects before writing any code. Use this skill when a project touches 3+ files, features require coordinated steps, scope is vague or ambitious, or before dispatching sub-agents. Produces plans where every task is executable in 2-5 minutes with exact file paths, commands, and code. Zero placeholders, zero TBDs. Triggers include: 'plan this feature', 'implementation plan', 'how should I structure', 'I need to build X', 'refactor the whole', 'multi-file change', 'before I start coding', 'break this down'. FR triggers : 'plan', 'fais un plan', 'comment structurer', 'découpe ça', 'avant de coder', 'je veux construire', 'refactor complet', 'étapes', 'structure ce projet', 'plan d'implémentation', 'comment m'y prendre', 'par où commencer'.
---

# Writing Plans — Planification structurée

> Source: adapté de [obra/superpowers](https://github.com/obra/superpowers)

## Principe fondamental

Avant de coder un projet complexe, créer un plan d'implémentation détaillé. Chaque tâche doit être exécutable en 2-5 minutes par quelqu'un qui ne connaît pas le codebase.

## Quand utiliser

- Tout projet qui touche plus de 3 fichiers
- Toute feature qui nécessite plusieurs étapes coordonnées
- Quand le scope est flou ou ambitieux
- Avant de dispatcher des sous-agents

## Principes clés

### Vérification du scope
- Décomposer les specs multi-systèmes en plans séparés
- Chaque plan produit du logiciel testable indépendamment

### Design de la structure de fichiers
- Mapper les fichiers AVANT de définir les tâches
- Chaque fichier = une responsabilité
- Suivre les patterns existants du codebase

### Granularité des tâches
- **2-5 minutes** par tâche
- Une tâche = une action : écrire test → vérifier échec → implémenter → vérifier succès → commit
- Inclure le code réel, les chemins exacts, les commandes à exécuter

### Zéro placeholder
- Chaque étape contient le contenu complet
- Pas de "TBD", "ajouter la validation", "similaire à la tâche N"
- Montrer toutes les signatures exactes

## Template de plan

```markdown
# [Nom de la feature] — Plan d'implémentation

**Objectif :** [Une phrase décrivant ce qu'on construit]
**Architecture :** [2-3 phrases sur l'approche]
**Stack :** [Technologies/librairies clés]

---

## Fichiers concernés
- `chemin/fichier1.ts` — [rôle]
- `chemin/fichier2.ts` — [rôle]

## Tâches

### Tâche 1 : [Nom descriptif]
- [ ] Étape 1 : [action exacte avec code/commande]
- [ ] Étape 2 : [vérification]

### Tâche 2 : [Nom descriptif]
- [ ] Étape 1 : ...
```

## Auto-revue après rédaction

Avant de considérer le plan comme terminé :

1. **Couverture du spec** — mapper chaque exigence à une tâche
2. **Scan de placeholders** — chercher TODO, TBD, "ajouter", "similaire à"
3. **Cohérence des noms** — vérifier que les types/méthodes sont cohérents entre tâches

## Revue du plan

Après rédaction, vérifier :

| Catégorie | Quoi vérifier |
|-----------|---------------|
| Complétude | TODOs, placeholders, étapes manquantes |
| Alignement spec | Le plan couvre les exigences, pas de scope creep |
| Décomposition | Tâches avec frontières claires, étapes actionnables |
| Exécutabilité | Un développeur peut suivre ce plan sans être bloqué |

**Approuver sauf si** : exigences manquantes, étapes contradictoires, contenu placeholder, tâches trop vagues.
