---
title: 'Privacy Policy'
---

*Last Updated: 20/12/2022*

By using services offered by Sentry ("we"), including but not limited to the Sentry Discord bot, this website, and our Phishertools service, you agree and consent to this policy, along with the [Terms of Service](/docs/tos) and the [Responsible Security Disclosure Policy](/docs/security).

Sentry is required to collect information to function properly. We ask for what we need, and we aim to be transparent about our data collection. We take adequate steps to secure our data, and we will provide notice should a breach occur.

When handling your data, we follow this policy, alongside the [Discord Developer Terms of Service](https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service) and the [Discord Developer Policy](https://discord.com/developers/docs/policies-and-agreements/developer-policy)

We frequently update these policies to accurately reflect the requirements of Sentry. Should we make an alteration to any of our policies, we will provide 14 days notice before the change takes effect.

By inviting and using Sentry, you agree to the terms of service and privacy policy of Sentry.

## Collection of Data

We need to collect and store data to provide our services to you.

In our database, we store:

- Discord IDs
- Command Options
- Custom settings you have applied to your guild or accountable
	- Such as the encrypted versions of your 2FA token and backup code
	- The guild's settings, such as for enforcing 2FA or freezing punishment

Discord does not recognise any data we collect as PII (personally identifiable information), however, we designate all forms of ID collected from Discord as potentially personally identifiable, and therefore handle it accordingly (see [our data storage policy](#data-storage))

Usage of services such as a timed punishment (excl. timeouts) will include extra information stored temporarily in a cache. This record is deleted once the punishment expires, and all data associated with it is encrypted and secured.

## Data Storage

We aim to keep our data stored safely. We encrypt all forms of PII, alongside other sensitive information at rest.

In addition to encrypting PII, we encrypt other forms of sensitive information, such as user inputted strings and all forms of 2FA authentication, such as your token and your backup code.

Should we find that a data breach occurs, we will take strong action to prevent the further loss of data. These steps include resetting all security codes, re-encrypting the database with a new key, and notifying users if they are affected.

## Usage of Data

We use our data as part of our core service.

Our core service requires the following data to function:

- Discord IDs
- Any data inputted through a command option

You can opt-in to further data collection through usage of certain features.

Should you use any 2FA commands, you opt into us collecting information about your 2FA tokens and backup codes.

## 3rd Parties Data Access

No 3rd Parties are given access to our data or our backend infrastructure.

## Opting Out

If you want to opt out of data collection, you will need to stop using our services. There are two ways to opt-out of data collection

### Automatic Data Removal

If you remove Sentry from your server, we will delete all data associated with your guild.

<script>
  import { Alert } from 'flowbite-svelte';
</script>

<Alert border color="red">
  <svg slot="icon" aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
  <span class="font-medium">Removing Sentry from your server will trigger an immediate deletion of all data related to the guild. This includes all punishment data. <br/><br/>We cannot restore previous punishments if Sentry is removed from your server.</span>
</Alert>

We aim to complete all requests within a few minutes of being removed, but the data removal process can take up to 28 days.

### Manual Data Removal

If you want us to manually delete your data associated with your guild, we can do so through reaching out over [email](mailto:josh@penpow.dev).

## Contact Us

If you have any questions about this policy, or any other queries in regards to Sentry, please reach out to us on [email](mailto:josh@penpow.dev).