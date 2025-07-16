import { IntegrationConfig } from '@/types/Integration';

export const INTEGRATION_CONFIGS: IntegrationConfig[] = [
	// Support Integrations
	{
		provider: 'zendesk',
		name: 'Zendesk',
		description: 'Import support tickets and customer feedback from your Zendesk instance',
		icon: 'headphones',
		type: 'oauth',
		category: 'support',
		status: 'available',
		popular: true,
		configFields: [
			{
				name: 'subdomain',
				label: 'Zendesk Subdomain',
				type: 'text',
				placeholder: 'your-company',
				required: true,
				description:
					'Your Zendesk subdomain (e.g., if your URL is https://mycompany.zendesk.com, enter "mycompany")',
			},
		],
	},
	{
		provider: 'intercom',
		name: 'Intercom',
		description: 'Connect your Intercom workspace to import conversations and customer insights',
		icon: 'messageCircle',
		type: 'oauth',
		category: 'support',
		status: 'coming_soon',
		popular: true,
	},

	// Communication Integrations
	{
		provider: 'slack',
		name: 'Slack',
		description: 'Monitor channels and threads for customer feedback and feature requests',
		icon: 'hash',
		type: 'oauth',
		category: 'communication',
		status: 'coming_soon',
		popular: true,
	},
	{
		provider: 'discord',
		name: 'Discord',
		description: 'Track community discussions and feedback from your Discord server',
		icon: 'gamepad2',
		type: 'oauth',
		category: 'communication',
		status: 'coming_soon',
	},
	{
		provider: 'teams',
		name: 'Microsoft Teams',
		description: 'Integrate with Teams channels for internal feedback and collaboration',
		icon: 'users',
		type: 'oauth',
		category: 'communication',
		status: 'coming_soon',
	},

	// Development Integrations
	{
		provider: 'github',
		name: 'GitHub',
		description: 'Import issues, pull requests, and discussions from your GitHub repositories',
		icon: 'github',
		type: 'oauth',
		category: 'development',
		status: 'coming_soon',
		popular: true,
	},
	{
		provider: 'jira',
		name: 'Jira',
		description: 'Sync tickets and project management data from Atlassian Jira',
		icon: 'gitBranch',
		type: 'oauth',
		category: 'development',
		status: 'coming_soon',
	},

	// CRM Integrations
	{
		provider: 'hubspot',
		name: 'HubSpot',
		description: 'Connect your CRM to analyze customer feedback and support interactions',
		icon: 'building2',
		type: 'oauth',
		category: 'crm',
		status: 'coming_soon',
	},
	{
		provider: 'salesforce',
		name: 'Salesforce',
		description: 'Import customer data and support cases from Salesforce',
		icon: 'cloudLightning',
		type: 'oauth',
		category: 'crm',
		status: 'coming_soon',
	},
];

export const getIntegrationConfig = (provider: string): IntegrationConfig | undefined => {
	return INTEGRATION_CONFIGS.find((config) => config.provider === provider);
};

export const getIntegrationsByCategory = (category: string): IntegrationConfig[] => {
	return INTEGRATION_CONFIGS.filter((config) => config.category === category);
};

export const getPopularIntegrations = (): IntegrationConfig[] => {
	return INTEGRATION_CONFIGS.filter((config) => config.popular);
};

export const getAvailableIntegrations = (): IntegrationConfig[] => {
	return INTEGRATION_CONFIGS.filter((config) => config.status === 'available');
};
