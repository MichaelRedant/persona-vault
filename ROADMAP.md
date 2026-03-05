# Roadmap - Persona Vault (Zonder Datums)

## Doel
Deze roadmap vertaalt de audit naar een uitvoerbaar implementatieplan zonder kalenderdata.
De focus is:
- eerst risico wegnemen;
- daarna stabiliteit en onderhoudbaarheid verhogen;
- vervolgens een duidelijke, onderscheidende UI/UX neerzetten.

## Implementatieprincipes
- Security first: geen nieuwe features boven kritieke security-issues.
- Small batches: werk in kleine, shipbare iteraties.
- Definition of Done per fase: alleen doorgaan naar volgende fase als criteria gehaald zijn.
- Meetbaar resultaat: elke fase sluit af met concrete acceptatiecriteria.

## Fase 0 - Security en Vertrouwen
### Doel
Kritieke beveiligings- en datarisico's elimineren.

### Werkpakketten
1. Secrets en configuratie opschonen
- Verplaats `JWT_SECRET` en DB-credentials naar environment variabelen.
- Maak `api/config.php` en `api/db.php` env-gedreven.
- Voeg `.env.example` toe met placeholders.
- Roteer bestaande secrets.

2. Onveilige endpoints uitschakelen
- Bescherm of verwijder `db_test.php`, `migrate_workspace_ids.php`, `test_auth.php`.
- Zorg dat debug/maintenance endpoints niet publiek bereikbaar zijn.

3. Auth en autorisatie harden
- Voer consistente rolcontrole in (`admin`, `editor`, `viewer`) op alle muterende endpoints.
- Valideer workspace membership centraal bij elke request.
- Verwijder permissie-afwijkingen tussen endpoints.

4. Input/output hardening
- Sanitize HTML-content server-side voor opslag of output.
- Beperk `dangerouslySetInnerHTML` tot gesaniteerde content.
- Voeg basis security headers toe (CSP, X-Content-Type-Options, etc.).

5. Share-link beveiliging
- Voeg expiry, revoke en minimale scope toe aan workspace shares.
- Log en monitor gebruik van share tokens.

### Deliverables
- Centrale auth/permission helper die door alle endpoints wordt gebruikt.
- Eenvormige foutresponsen zonder stacktrace of SQL details.
- Security checklist als document in repo.

### Definition of Done
- Geen hardcoded secrets in repo.
- Geen publiek onbeschermde maintenance endpoints.
- Geen bekende stored XSS-routes open in persona/prompt rendering.

## Fase 1 - Architectuur en Codekwaliteit
### Doel
De codebase onderhoudbaar en voorspelbaar maken.

### Werkpakketten
1. Frontend structuur herorganiseren
- Splits `src/App.jsx` op in feature-containers.
- Introduceer route-level of feature-level state boundaries.
- Verwijder duplicate/legacy componenten en typo-bestanden.

2. API laag uniformiseren
- Maak een gedeelde API client met consistente error handling.
- Standaardiseer HTTP-methodes en CORS-ondersteuning.
- Uniforme request/response schema's per endpointfamilie.

3. Logging en foutafhandeling
- Verwijder development `console.log` noise.
- Maak een standaard toast/error patroon voor gebruikersfeedback.
- Gebruik server-side log levels (info/warn/error).

4. Dependency en build hygiene
- Update kwetsbare packages.
- Introduceer code splitting op zware routes/modals.
- Verminder hoofd-bundle grootte.

### Deliverables
- Nieuwe mapstructuur met duidelijke scheiding: pages/components/hooks/api.
- Een gedeelde fetch-helper met retry/timeout/error parsing.
- Opgeschoonde linting rules zonder globale uitschakeling.

### Definition of Done
- Geen monolithische `App.jsx` meer.
- Geen endpoint-specifieke afwijkingen in basisfoutafhandeling.
- Build zonder kritieke dependency waarschuwingen.

## Fase 2 - UX Fundament en Consistentie
### Doel
Frictie verlagen en interacties consistent maken.

### Werkpakketten
1. Interactiepatronen uniformeren
- Vervang `alert/prompt/confirm` door consistente modals/dialogs.
- Eenduidige button states: loading, success, error, disabled.
- Correcte destructive action flow met expliciete confirmatie.

2. Kernflows afwerken
- Collections: search, rename, delete flow volledig betrouwbaar.
- Workspace switch en share flow duidelijker en voorspelbaar.
- Betere lege staten en foutstaten per dashboard.

3. Toegankelijkheid
- Correcte labels/ids op form controls.
- Focus trap en keyboard ondersteuning in modals/dropdowns.
- Contrast en aria-attributen voor icon-only acties.

4. Visuele coherentie
- Definieer design tokens (kleur, spacing, radius, shadow).
- Harmoniseer component-styling over dashboards en marketplace.

### Deliverables
- UX patterns document met componentgedrag.
- Toegankelijkheidschecklist voor nieuwe componenten.

### Definition of Done
- Geen browser-native alerts meer in primaire flows.
- Kernflows zijn consistent op desktop en mobiel.
- Baseline accessibility issues opgelost.

## Fase 3 - Product Differentiatie
### Doel
Functies bouwen die Persona Vault onderscheidend maken.

### Werkpakketten
1. Revisions 2.0
- Duidelijkere diff-weergave en rollback preview.
- Betere metadata (wie, wanneer, wat gewijzigd).

2. Samenwerking
- Gelaagde share modes (read/comment/clone).
- Workspace-specifieke rechten zichtbaar in UI.

3. Workflow versnellers
- Curated templates/workflow packs.
- Snelle import in bestaande collecties.
- Slimme suggesties voor tags en structuur.

### Deliverables
- Nieuwe differentierende workflows die direct zichtbaar zijn voor gebruikers.
- Heldere onboarding rond nieuwe mogelijkheden.

### Definition of Done
- Minstens 2 unieke workflows die concurrenten niet standaard aanbieden.
- Revisions en collaboration voelen als kernfeature, niet als add-on.

## Fase 4 - Marketplace Volwassenheid
### Doel
Marketplace veilig, bruikbaar en betrouwbaar maken.

### Werkpakketten
1. Data-integriteit en eigendom
- Valideer listing ownership hard bij create/update/delete.
- Forceer correcte relatie tussen listing en bron-item.

2. Kwaliteit en vertrouwen
- Voeg trust signals toe (owner badges, verificatie, listing status).
- Basis moderation en rapportageflow.

3. Vindbaarheid
- Betere filters/sortering/relevantie.
- Duidelijke detailpagina met consistente CTA's.

### Deliverables
- Marketplace policy en validatieregels.
- Verbeterde listing UX en beheerflow.

### Definition of Done
- Geen ownership bypass meer mogelijk.
- Listing lifecycle volledig consistent en auditeerbaar.

## Continu Verbeterproces
Gebruik dit als vaste checklist per nieuw werkitem:
- Security: auth, input validatie, output escaping, scope check.
- UX: duidelijke feedback, loading state, error state, empty state.
- Performance: impact op bundle size en rendering.
- Quality: lint/test/build pass.
- Documentatie: update README/roadmap/changelog waar nodig.

## Ready-to-Start Backlog (Eerste Tickets)
- [x] 1. Env-migratie voor `api/config.php` en `api/db.php`.
- [x] 2. Uitschakelen of beveiligen van maintenance/debug endpoints.
- [x] 3. Centrale RBAC helper implementeren en aansluiten op alle mutaties.
- [x] 4. HTML sanitization pipeline invoeren voor personas/prompts.
- [x] 5. Collection delete-confirm fixen (async confirm correct afhandelen).
- [x] 6. `App.jsx` opdelen in container + feature modules.
- [x] 7. Gedeelde API client introduceren en hooks migreren.
- [x] 8. Alle native browser alerts vervangen door UI-dialogs/toasts.
- [x] 9. Dependency security updates uitvoeren.
- [x] 10. Marketplace ownership-validatie afdwingen op `listings_create.php`.
- [x] 11. Marketplace create-flow corrigeren met item-picker (geen hardcoded `item_id`).
- [x] 12. Route/dashboard/modal code-splitting doorvoeren om hoofd-bundle te verkleinen.
- [x] 13. Frontend console-noise opruimen + consistente foutfeedback in async flows.
- [x] 14. Uniforme loading/error/empty states uitrollen op kernschermen en modals.
- [x] 15. Toegankelijkheidspass op modals/dropdowns/forms (labels, focus, keyboard, aria).
- [x] 16. Design tokens invoeren + styling harmoniseren over dashboards en marketplace.
- [x] 17. Revisions 2.0: type-aware diff-weergave + rollback preview in de UI.
- [x] 18. Samenwerking: share modes (read/comment/clone) + zichtbare rechten in shared workspace en hoofdapp UI (role-aware acties).
- [x] 19. Workflow versnellers: curated workflow packs + quick import naar collecties + slimme tag/structuursuggesties in forms.
- [x] 20. Marketplace data-integriteit: ownership + workspace-scope harden op `listings_update.php` en `listings_delete.php`, inclusief bron-item/cover validatie en `can_manage` gating in search/UI.
- [x] 21. Marketplace trust signals + basis moderation/rapportage: verified/trusted badges, status-signalen, user report flow en admin moderation queue.
- [x] 22. Marketplace vindbaarheid + detail CTA: uitgebreide filters (type/tag/status/visibility), sortering/relevantie, deep-link naar listing detail en consistente CTA’s (copy link/report/download).
- [x] 23. Marketplace lifecycle audittrail: eventlog voor create/update/delete/report/moderation + listing detail history-timeline + policydocument met validatieregels.
- [x] 24. DB schema-stabilisatie: baseline migratie-endpoint + admin schema-health check + documentatie voor veilige rollout en drift-detectie.

## Nieuwe UI/UX Audit Backlog (Volgende Uitvoering)
- [x] 25. API-base consistentie in frontend herstellen: alle hardcoded `'/api/...'` calls vervangen door `VITE_API_BASE_URL` (start met profile flows) zodat deploy onder `/vault` stabiel blijft.
- [x] 26. Accessibility baseline afdwingen: labels koppelen aan inputs (`htmlFor`/`id`), `aria-label` toevoegen op icon-only knoppen, en keyboard/screenreader ondersteuning op mobile bottom nav.
- [x] 27. Modal veiligheid verhogen: accidental close beperken (backdrop policy), expliciete dirty-state confirm bij form modals, en uniforme close affordance in alle modals.
- [x] 28. Mobile input-frictie verlagen: automatische autofocus van search verwijderen en focusgedrag enkel contextueel activeren.
- [ ] 29. Header IA vereenvoudigen: dubbele profile entries consolideren naar een accountmenu met duidelijke actiehierarchie.
- [ ] 30. Collectiekaarten keyboard-toegankelijk maken: klikbare card-wrapper omzetten naar semantische button/link interactie met focus states.
- [ ] 31. Sidebar desktop-collapse verbeteren: compact rail behouden i.p.v. volledig off-canvas gedrag voor voorspelbare navigatie.
- [ ] 32. Toast-systeem uniformeren: een positioneringsverantwoordelijkheid, `aria-live` toevoegen, en overlap/race-condities vermijden.
- [ ] 33. Taalconsistentie in UI copy herstellen: een taalregime per surface (NL of EN) en gemixte feedbackstrings verwijderen.
- [ ] 34. UI component cleanup: duplicate/stale componenten opruimen (`AddCollectionModal` varianten, typo-bestanden zoals `onfirmDialog`) en een canonieke variant behouden.

