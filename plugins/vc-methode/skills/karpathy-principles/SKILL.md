---
name: karpathy-principles

description: >
  Four anti-error rules from Andrej Karpathy's observations about LLMs in coding: think before coding, simplicity first, surgical changes, goal-oriented execution. Use this skill at the start of any non-trivial coding task, before making assumptions, when tempted to add scope, when editing existing code, or when a task is vague. Triggers include: planning a feature, starting a refactor, editing code you didn't write, reviewing a diff, 'keep it simple', 'don't over-engineer', 'minimal change'. FR triggers : 'avant de coder', 'ne rien supposer', 'touche le minimum', 'garde simple', 'avant de refactor', 'avant de modifier ce code', 'réfléchis avant', 'pas d'over-engineering'.
---

# Karpathy Principles — Règles anti-erreurs LLM

> Source: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
> Basé sur les observations d'Andrej Karpathy sur les erreurs courantes des LLM en coding.

## 1. Réfléchir avant de coder

**Ne pas assumer. Ne pas cacher la confusion. Exposer les compromis.**

- Énoncer ses hypothèses explicitement. Si incertain, demander.
- Si plusieurs interprétations existent, les présenter — ne pas choisir en silence.
- Si une approche plus simple existe, le dire. Pousser back quand c'est justifié.
- Si quelque chose est flou, s'arrêter. Nommer ce qui est confus. Demander.

## 2. Simplicité d'abord

**Le minimum de code qui résout le problème. Rien de spéculatif.**

- Pas de features au-delà de ce qui est demandé
- Pas d'abstractions pour du code à usage unique
- Pas de "flexibilité" ou "configurabilité" non demandée
- Pas de gestion d'erreurs pour des scénarios impossibles
- Si 200 lignes peuvent être 50, réécrire

Test : "Un dev senior dirait-il que c'est trop compliqué ?" Si oui, simplifier.

## 3. Changements chirurgicaux

**Toucher uniquement ce qui est nécessaire. Ne nettoyer que son propre désordre.**

- Ne pas "améliorer" le code adjacent, les commentaires ou le formatage
- Ne pas refactorer ce qui n'est pas cassé
- Correspondre au style existant, même si on ferait autrement
- Si du code mort est repéré, le mentionner — ne pas le supprimer

Quand ses propres changements créent des orphelins :
- Supprimer les imports/variables/fonctions rendus inutiles par SES changements
- Ne pas supprimer le code mort pré-existant sauf demande explicite

Test : chaque ligne modifiée doit tracer directement vers la demande de l'utilisateur.

## 4. Exécution orientée objectif

**Définir les critères de succès. Boucler jusqu'à vérification.**

Transformer les tâches en objectifs vérifiables :
- "Ajouter la validation" → "Écrire des tests pour les entrées invalides, puis les faire passer"
- "Fixer le bug" → "Écrire un test qui le reproduit, puis le faire passer"
- "Refactorer X" → "S'assurer que les tests passent avant et après"

Pour les tâches multi-étapes, énoncer un plan bref :
```
1. [Étape] → vérifier : [check]
2. [Étape] → vérifier : [check]
3. [Étape] → vérifier : [check]
```

Des critères de succès forts permettent de boucler en autonomie. Des critères faibles ("fais que ça marche") nécessitent des clarifications constantes.

---

**Ces règles fonctionnent si :** moins de changements inutiles dans les diffs, moins de réécritures dues à la sur-complexité, et les questions de clarification arrivent AVANT l'implémentation plutôt qu'après les erreurs.
