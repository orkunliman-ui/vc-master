# VC Master

59 skills Claude Code triés en 7 sections. Chaque section est un plugin :
tu installes seulement ce qui t'intéresse.

## Installer

Décompresse le dossier, par exemple dans `~/vc-master`, puis choisis une option.

### Option 1 — plugins Claude Code (recommandé)

```bash
claude plugin marketplace add ~/vc-master
claude plugin install vc-methode@vc-master      # une section
```

Ou dans Claude Code : `/plugin marketplace add ~/vc-master`, puis `/plugin` pour cocher les sections.
Les skills prennent le nom de leur section : `/vc-methode:juges`, `/vc-frontend:frontend-design`…

### Option 2 — copie simple dans `~/.claude/skills`

```bash
cd ~/vc-master
./install.sh                         # toutes les sections
./install.sh vc-methode vc-frontend  # seulement celles-là
```

Les skills gardent leur nom court (`/juges`, `/frontend-design`). Un skill déjà présent
chez toi n'est jamais écrasé. Relance Claude Code ensuite.

### Par où commencer

`vc-methode` (surtout `juges`, `writing-plans`, `systematic-debugging`,
`verification-before-completion`) et `caveman` dans `vc-boost`.

## Les sections

### Méthode de dev — `vc-methode` (10)

Réfléchir, planifier, coder, déboguer, vérifier et trancher comme une équipe senior.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `juges` | 3 juges (Optimiste, Sceptique, Pragmatique) débattent jusqu'à élire à l'unanimité la meilleure formule d'un projet. | Skill maison |
| `brainstorming` | Clarifie l'intention et le design avant de créer une fonctionnalité. | [obra/superpowers](https://github.com/obra/superpowers) |
| `writing-plans` | Découpe un gros chantier en étapes de 2-5 min, chemins et commandes exacts. | [obra/superpowers](https://github.com/obra/superpowers) |
| `karpathy-principles` | Les 4 règles anti-erreurs de Karpathy : réfléchir, simplifier, changer le minimum, viser le but. | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) |
| `systematic-debugging` | Débogage en 4 phases : la cause racine avant tout correctif. | [obra/superpowers](https://github.com/obra/superpowers) |
| `test-driven-development` | Cycle TDD : test rouge, code vert, refactor. | [obra/superpowers](https://github.com/obra/superpowers) |
| `verification-before-completion` | Interdit de dire « c'est fait » sans preuve (tests, logs). | [obra/superpowers](https://github.com/obra/superpowers) |
| `requesting-code-review` | Demander une revue de code au bon moment, avec le bon contexte. | [obra/superpowers](https://github.com/obra/superpowers) |
| `subagent-driven-development` | Exécuter un plan tâche par tâche avec des sous-agents, revue entre chaque. | [obra/superpowers](https://github.com/obra/superpowers) |
| `using-git-worktrees` | Travailler isolé sur une branche avec git worktree. | [obra/superpowers](https://github.com/obra/superpowers) |

### Booster Claude Code — `vc-boost` (11)

Moins de tokens, plus d'autonomie, et fabriquer ses propres skills.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `caveman` | Réponses ultra-compressées (~75 % de tokens en moins), précision technique intacte. | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `caveman-commit` | Messages de commit courts au format Conventional Commits. | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `caveman-review` | Revue de code en une ligne par remarque : endroit, problème, correctif. | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `caveman-compress` | Compresse un CLAUDE.md ou une todo pour économiser des tokens. | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `caveman-help` | Aide-mémoire des modes caveman. | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) |
| `cost-reducer` | Audit et réduction des coûts tokens et API Anthropic. | Skill maison |
| `lean-ctx` | Mode d'emploi du serveur MCP lean-ctx (lectures et commandes compressées). | [yvgude/lean-ctx](https://github.com/yvgude/lean-ctx) |
| `create-skill` | Usine à skills : conçoit, écrit, teste et améliore un skill. | Skill maison |
| `find-skills` | Trouve et installe un skill existant pour un besoin. | [vercel-labs/skills](https://github.com/vercel-labs/skills) |
| `self-improving-agent` | Fait apprendre Claude de ses erreurs d'une session à l'autre. | Skill maison |
| `mcp-builder` | Construire un serveur MCP propre (Python ou TypeScript). | [anthropics/skills](https://github.com/anthropics/skills) |

### Frontend & design — `vc-frontend` (8)

Sites et interfaces au niveau des meilleurs studios.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `frontend-design` | Designer UI/UX et dev frontend : pages, dashboards, design systems. | Skill maison |
| `screenshot-to-code` | Copier une interface depuis une capture, fidélité mesurée (SSIM) et chiffrée. | Skill maison |
| `scroll-sequence-ultra-hd` | Séquences d'images pilotées au scroll en ultra-HD, avec contrôles automatiques. | Skill maison |
| `motion` | Animations React avec Motion (ex-Framer Motion). | [secondsky/claude-skills](https://github.com/secondsky/claude-skills) |
| `web-design-guidelines` | Audit d'une interface contre les règles de design web de Vercel. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| `vercel-react-best-practices` | Règles de performance React et Next.js de Vercel. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| `vercel-composition-patterns` | Patterns de composition React qui tiennent à l'échelle. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| `vercel-react-view-transitions` | Transitions de page fluides avec l'API View Transitions. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

### Vidéo & motion design — `vc-video` (15)

Vidéos promo, motion design et prompts de génération vidéo IA.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `hyperframes` | Point d'entrée : toute vidéo, animation ou motion graphic en HTML (HyperFrames). | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-core` | Structure d'une composition : pistes, timing, clips. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-animation` | Toute l'animation : GSAP, Lottie, Three.js, transitions, effets de texte. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-creative` | Direction créative et références visuelles. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-keyframes` | Keyframes et courbes d'animation. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-audio` | Mixage : fondus, ducking, effets, automation. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-cli` | La CLI HyperFrames : aperçu, contrôle, rendu local ou cloud. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-registry` | Catalogue de blocs et composants réutilisables. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `hyperframes-studio` | Le studio d'édition HyperFrames. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `general-video` | Composition libre : reels, montages, title cards, pièces longues. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `motion-graphics` | Motion design court sans narration, titres animés. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `product-launch-video` | Vidéo de lancement produit. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `music-to-video` | Vidéo calée sur une musique (beats, primitives de mouvement). | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `media-use` | Trouver ou générer musique, bruitages et voix off. | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |
| `higgsfield-ai-prompt-skill` | Prompts et choix de modèle pour Higgsfield AI (Kling, Sora, Veo…). | [OSideMedia/higgsfield-ai-prompt-skill](https://github.com/OSideMedia/higgsfield-ai-prompt-skill) |

### Marketing & SEO — `vc-marketing` (7)

Être trouvé sur Google et par les IA, et vendre avec des pubs qui convertissent.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `seo-audit` | Audit SEO technique et on-page. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `seo-local` | SEO local et fiche Google Business Profile. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| `ai-seo` | Être cité par ChatGPT, Perplexity, Claude (AEO / GEO, llms.txt). | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `schema` | Données structurées schema.org. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `ads` | Campagnes Google, Meta, LinkedIn : ciblage, enchères, optimisation. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `ad-creative` | Génère et décline des textes publicitaires à grande échelle. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `humanizer` | Rend un texte écrit par IA naturel et humain. | Skill maison |

### Sécurité & serveurs — `vc-securite` (5)

Auditer une app web et durcir un serveur Linux.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `security` | Audit sécurité complet d'une app web (OWASP, headers, dépendances, secrets). | Skill maison |
| `security-and-hardening` | Bonnes pratiques de sécurité dans le code. | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) |
| `linux-hardening` | Durcissement Linux selon CIS : SSH, utilisateurs, pare-feu. | [bagelhole/devops-security-agent-skills](https://github.com/bagelhole/devops-security-agent-skills) |
| `analyzing-linux-audit-logs-for-intrusion` | Détecter une intrusion dans les logs auditd. | [mukul975/anthropic-cybersecurity-skills](https://github.com/mukul975/anthropic-cybersecurity-skills) |
| `analyzing-web-server-logs-for-intrusion` | Détecter les attaques dans les logs Nginx et Apache. | [mukul975/anthropic-cybersecurity-skills](https://github.com/mukul975/anthropic-cybersecurity-skills) |

### Automatisation & intégrations — `vc-automatisation` (3)

Brancher Claude sur n8n, Google Docs et X/Twitter.

| Skill | À quoi ça sert | Source |
|---|---|---|
| `n8n` | Construire et piloter des workflows n8n par l'API. | Skill maison |
| `google-docs-maton` | Créer et éditer des Google Docs via la passerelle Maton. | Skill maison |
| `twitterapi-io` | Lire et publier sur X/Twitter via twitterapi.io. | [kaitoInfra/twitterapi-io](https://github.com/kaitoInfra/twitterapi-io) |

## Avant d'utiliser

Certains skills appellent des outils ou des comptes externes ; le SKILL.md de chacun dit quoi installer :

- `lean-ctx` : le binaire et le serveur MCP lean-ctx.
- Section vidéo : la CLI HyperFrames (`npx hyperframes`, Node.js) ; `higgsfield-ai-prompt-skill` : un compte Higgsfield.
- `screenshot-to-code` : `npm install` dans `scripts/`, plus Python 3.
- `scroll-sequence-ultra-hd` : Playwright et FFmpeg (`CHROME_PATH` pour un autre navigateur).
- `n8n`, `google-docs-maton`, `twitterapi-io` : ta propre clé API (jamais dans le skill lui-même).

## Crédits

Une partie des skills vient de dépôts publics, sous leur licence d'origine : voir [CREDITS.md](CREDITS.md).
