import {createAnthropic} from '@ai-sdk/anthropic';
import {generateText} from 'ai';

export interface AIConfig {
	model?: string;
	apiKey?: string;
}

export class AIService {
	private model: string;
	private apiKey: string;
	private anthropic: ReturnType<typeof createAnthropic>;

	constructor(config: AIConfig = {}) {
		this.model = config.model || 'claude-3-5-sonnet-20241022';
		this.apiKey = config.apiKey || process.env['ANTHROPIC_API_KEY'] || '';
		this.anthropic = createAnthropic({apiKey: this.apiKey});

		if (!this.apiKey) {
			throw new Error('ANTHROPIC_API_KEY is required');
		}
	}

	async generateResponse(prompt: string): Promise<string> {
		try {
			const {text} = await generateText({
				model: this.anthropic(this.model),
				prompt,
				temperature: 0.7,
				maxTokens: 2000,
			});

			return text;
		} catch (error) {
			console.error('AI generation error:', error);
			return 'Sorry, I encountered an error while processing your request.';
		}
	}

	setModel(modelName: string) {
		this.model = modelName;
	}

	getModel(): string {
		return this.model;
	}
}
