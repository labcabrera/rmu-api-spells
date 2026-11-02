# [0.1.0](https://github.com/labcabrera/rmu-api-spells/compare/0.0.0...0.1.0) (2026-11-02)


### Bug Fixes

* error path without the query string, spell examples and a public health check ([f26f857](https://github.com/labcabrera/rmu-api-spells/commit/f26f8570a3178e5ff177383d978bdb56798feed1))
* give the Kafka consumer its own group ([f7e83c3](https://github.com/labcabrera/rmu-api-spells/commit/f7e83c3c8cf3b770eb14dff269e7c4afb6b4ad14))
* read spells stored without modifiers with empty ones ([0abc814](https://github.com/labcabrera/rmu-api-spells/commit/0abc814c9c2c8442c8b1200378f9169c1669bc8c))
* reject deleting a spell list that still has spells ([511d716](https://github.com/labcabrera/rmu-api-spells/commit/511d716c2dfafbc57d1619d6cab1d1472ef8c15a))
* **spell-lists:** serve the spell lists as a catalog of up to 1000 ([19cdc14](https://github.com/labcabrera/rmu-api-spells/commit/19cdc14efc0af66127bc8a0633b5cee861560f82))
* validate realm and type of spell lists and check names per owner ([4fee85d](https://github.com/labcabrera/rmu-api-spells/commit/4fee85d3e0bb4cc09a7b522b7bf7e2980fbea69b))
* validate request bodies without implicit conversion ([fe74d1e](https://github.com/labcabrera/rmu-api-spells/commit/fe74d1ea20090e6af643c2fed7586d4df6ef0bd8))
* validate the spell body and merge the patched modifiers ([741fc56](https://github.com/labcabrera/rmu-api-spells/commit/741fc560400c28c473115fb844afd6296b9a9afa))


### Features

* adopt the api-core HTTP contract and repository (spec 020) ([ffa1028](https://github.com/labcabrera/rmu-api-spells/commit/ffa10283fdcbf95eb63b19c1ad6200ad9124661f))
* **auth:** validate token issuer and audience ([482bf3a](https://github.com/labcabrera/rmu-api-spells/commit/482bf3aefe2f10a485700a6b5ff3919549203d84))
* get /v1/info with the name and version of the api ([28ad2e8](https://github.com/labcabrera/rmu-api-spells/commit/28ad2e87f3e79d362f2706526de30eaad1b1c6ab))
* spell catalog model with realms, effects and book modifiers ([0851d7a](https://github.com/labcabrera/rmu-api-spells/commit/0851d7a74d30973a50e7487d550d327b1dc587e6))
* **spell-lists:** entity source with admin-only system lists ([bc1f126](https://github.com/labcabrera/rmu-api-spells/commit/bc1f126861fb2d4cb4d0e3213f1dc739902102d0))
* spells follow the permissions and the visibility of their list ([68e05f2](https://github.com/labcabrera/rmu-api-spells/commit/68e05f246f02af40bd012d4c6a3f38e7b38033e7))
* **spells:** optional alchemy metadata of a spell ([fe8daa5](https://github.com/labcabrera/rmu-api-spells/commit/fe8daa5ff08e0fd3abeb2421e05793fc1a842f5c))
* **spells:** spells follow the entity source of their list ([eafbd1f](https://github.com/labcabrera/rmu-api-spells/commit/eafbd1fba766d5911a1e8abd7e19a6e4ded1a0ec))


### BREAKING CHANGES

* the spell modifiers drop target, rrModifier,
notRequiredPowerPoints and partOfSetOfSpells in favour of area,
resistance, powerPoints and setGroup; RMU_API_CORE_URI is required.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
