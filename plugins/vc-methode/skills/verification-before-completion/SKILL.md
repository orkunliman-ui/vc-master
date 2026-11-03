---
name: verification-before-completion

description: >
  Enforces proof-based verification before any claim of completion, success, or correctness. Use this skill before declaring tests pass, a bug fixed, a build successful, requirements met, or any work 'done'. Also before committing, pushing, creating PRs, or delegating to sub-agents. Triggers include: 'it should work', 'I think this is done', 'tests should pass', 'looks good', 'done', 'complete', 'fixed', 'works now', 'ready to commit', expressions of satisfaction with work state. FR triggers : 'c'est bon', 'c'est fait', 'ça devrait marcher', 'prêt à commit', 'terminé', 'fini', 'ça fonctionne', 'les tests devraient passer', 'c'est prêt', 'on peut push', 'déployable', 'ça tourne'. Forbids: partial verification, reliance on previous runs, claims like 'should' or 'probably'.
---

# Verification Before Completion

> Source: adapté de [obra/superpowers](https://github.com/obra/superpowers)

## Principe fondamental

**AUCUNE AFFIRMATION DE COMPLÉTION SANS PREUVE DE VÉRIFICATION FRAÎCHE.**

Dire que c'est terminé sans vérifier, c'est mentir, pas être efficace.

## La règle d'or

```
AVANT de dire que quelque chose est fait, fonctionne, ou passe :

1. IDENTIFIER : Quelle commande prouve cette affirmation ?
2. EXÉCUTER : Lancer la commande COMPLÈTE (fraîche, pas un résultat précédent)
3. LIRE : Sortie complète, code de retour, nombre d'échecs
4. VÉRIFIER : La sortie confirme-t-elle l'affirmation ?
   - NON → Donner le statut réel avec preuves
   - OUI → Affirmer AVEC preuves
5. SEULEMENT ALORS : Faire l'affirmation

Sauter une étape = mentir, pas vérifier.
```

## Ce qui constitue une preuve

| Affirmation | Requiert | Insuffisant |
|-------------|----------|-------------|
| Tests passent | Sortie de commande : 0 échecs | Run précédent, "devrait passer" |
| Linter clean | Sortie linter : 0 erreurs | Vérification partielle |
| Build réussi | Commande build : exit 0 | "Le linter passe" |
| Bug fixé | Test du symptôme original : passe | Code changé, supposé fixé |
| Test de régression | Cycle red-green vérifié | Test passe une fois |
| Exigences remplies | Checklist ligne par ligne | "Les tests passent" |

## Signaux d'alarme — STOP

Si tu es sur le point de :
- Utiliser "devrait", "probablement", "semble"
- Exprimer de la satisfaction avant vérification ("Super !", "Parfait !", "C'est fait !")
- Commit/push/PR sans vérification
- Se fier à une vérification partielle
- Penser "juste cette fois"

## Rationalisations interdites

| Excuse | Réalité |
|--------|---------|
| "Ça devrait marcher" | LANCE la vérification |
| "Je suis confiant" | Confiance ≠ preuve |
| "Juste cette fois" | Pas d'exception |
| "Le linter passe" | Linter ≠ compilateur |
| "L'agent dit que c'est OK" | Vérifier indépendamment |
| "Vérification partielle suffit" | Partiel ne prouve rien |

## Quand appliquer

**TOUJOURS avant :**
- Toute affirmation de succès/complétion
- Toute expression de satisfaction sur l'état du travail
- Commit, création de PR, complétion de tâche
- Passage à la tâche suivante
- Délégation à des sous-agents

## En résumé

**Lancer la commande. Lire la sortie. ENSUITE affirmer le résultat.**

Non négociable.
