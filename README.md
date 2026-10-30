# usage-du-jour

Affiche dans la ligne d'état de Claude Code l'utilisation du jour : le nombre de messages envoyés, les tokens consommés (entrée, écriture de cache et sortie, sous-agents compris) et une barre de progression vers un budget quotidien réglable (`budget_tokens`, 1 000 000 par défaut). Les compteurs sont gardés entre les sessions et repartent de zéro à minuit, heure locale.

## Installation

Dans une session Claude Code au terminal :

```
/plugin install usage-du-jour --marketplace tuturanet07-arch/usage-du-jour
```

Depuis un shell :

```
claude plugin install usage-du-jour --marketplace tuturanet07-arch/usage-du-jour
```

Dans l'app de bureau, où `/plugin` ne fonctionne pas : cliquez sur + à côté de la zone de saisie, puis Plugins, Add marketplace avec `tuturanet07-arch/usage-du-jour`, puis Add plugin.

Répondez `y` pour ajouter le marketplace, puis choisissez la portée (utilisateur par défaut).

## Licence

MIT
