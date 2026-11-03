---
name: systematic-debugging

description: >
  Systematic 4-phase debugging methodology: root cause investigation before any fix attempt. Use this skill for test failures, bugs, unexpected behavior, performance issues, build or integration problems. Critical when tempted to apply a quick fix or after 2+ failed fix attempts. Triggers include: 'fix this bug', 'tests are failing', 'this error', 'why doesn't this work', 'stack trace', 'broken', 'debug', 'investigate', 'find the issue', 'quick fix'. FR triggers : 'ça plante', 'ça marche pas', 'ça crash', 'cherche la cause', 'corrige ce bug', 'pourquoi ça marche pas', 'les tests échouent', 'trace d'erreur', 'investiguer', 'débugger', 'comprends pourquoi', 'trouve la cause racine'. Enforces: read errors fully, reproduce reliably, trace data flow, form ONE hypothesis, test minimally, stop after 3 failed fixes.
---

# Systematic Debugging

> Source: adapté de [obra/superpowers](https://github.com/obra/superpowers)

## Principe fondamental

**AUCUN FIX SANS INVESTIGATION DE LA CAUSE RACINE D'ABORD.**

Les patchs rapides masquent les problèmes sous-jacents. Le débogage systématique est plus rapide que le tâtonnement.

## Quand utiliser

- Échecs de tests, bugs, comportements inattendus
- Problèmes de performance, de build, d'intégration
- **Surtout** quand on est pressé ou que "un petit fix rapide" semble évident
- **Surtout** après 2+ tentatives de fix échouées

## Les 4 Phases

### Phase 1 : Investigation de la cause racine

**AVANT toute tentative de fix :**

1. **Lire les messages d'erreur** — complètement, stack traces incluses, noter lignes/fichiers/codes
2. **Reproduire de manière fiable** — étapes exactes, est-ce systématique ?
3. **Vérifier les changements récents** — git diff, commits récents, dépendances, config, environnement
4. **Collecter des preuves** (systèmes multi-composants) — ajouter des logs diagnostiques à chaque frontière de composant, exécuter une fois, identifier OÙ ça casse
5. **Tracer le flux de données** — d'où vient la mauvaise valeur ? Remonter la chaîne d'appels jusqu'à la source

### Phase 2 : Analyse des patterns

1. Trouver des exemples fonctionnels similaires dans le même codebase
2. Comparer avec les implémentations de référence (lire **chaque ligne**)
3. Lister **toutes** les différences, même les petites
4. Comprendre les dépendances et hypothèses

### Phase 3 : Hypothèse et test

1. **Formuler UNE hypothèse** — "Je pense que X est la cause racine parce que Y"
2. **Tester minimalement** — le PLUS PETIT changement possible, une variable à la fois
3. **Vérifier** — ça marche → Phase 4 / ça ne marche pas → nouvelle hypothèse
4. **Si on ne sait pas** — le dire, ne pas deviner

### Phase 4 : Implémentation

1. **Créer un test qui échoue** — reproduction la plus simple possible
2. **Implémenter UN SEUL fix** — adresser la cause racine, pas le symptôme, pas de "tant qu'on y est"
3. **Vérifier** — le test passe ? Pas de régression ?
4. **Si ≥ 3 fix échoués → STOP** — c'est probablement un problème d'architecture, pas un bug. Remettre en question les fondamentaux avant de continuer.

## Signaux d'alarme — STOP et revenir à la Phase 1

Si tu te surprends à penser :
- "Fix rapide pour l'instant, on investiguera plus tard"
- "Essayons de changer X pour voir"
- "C'est probablement X, fixons ça"
- "Je ne comprends pas tout mais ça devrait marcher"
- "Encore un essai" (quand déjà 2+ tentatives)

## Résumé rapide

| Phase | Activités clés | Critère de succès |
|-------|---------------|-------------------|
| 1. Cause racine | Lire erreurs, reproduire, tracer | Comprendre le QUOI et le POURQUOI |
| 2. Pattern | Trouver exemples, comparer | Identifier les différences |
| 3. Hypothèse | Formuler, tester minimalement | Confirmé ou nouvelle hypothèse |
| 4. Implémentation | Créer test, fixer, vérifier | Bug résolu, tests passent |
