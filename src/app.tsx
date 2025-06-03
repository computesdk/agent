import process from 'node:process';
import React, {useState, useEffect} from 'react';
import {Box, Text, useInput, useApp} from 'ink';
import TextInput from 'ink-text-input';
import {AIService} from './ai.js';
import * as dotenv from 'dotenv';

type Message = {
	id: number;
	type: 'user' | 'assistant';
	content: string;
};

export default function App() {
	const {exit} = useApp();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [aiService, setAiService] = useState<AIService | null>(null);
	const [currentModel, setCurrentModel] = useState(
		'claude-3-5-sonnet-20241022',
	);

	useEffect(() => {
		try {
			// Load environment variables
			dotenv.config();
			const service = new AIService();
			setAiService(service);
		} catch (error: any) {
			const errorMessage: Message = {
				id: 1,
				type: 'assistant',
				content: `Error initializing AI: ${error.message}. Please ensure ANTHROPIC_API_KEY is set in your .env file.`,
			};
			setMessages([errorMessage]);
		}
	}, []);

	useInput((_, key) => {
		if (key.escape) {
			exit();
		}
	});

	const handleCommand = (input: string): boolean => {
		const trimmed = input.trim();

		if (trimmed === '/exit') {
			exit();
			return true;
		}

		if (trimmed === '/clear') {
			setMessages([]);
			return true;
		}

		if (trimmed === '/help') {
			const helpMessage: Message = {
				id: messages.length + 1,
				type: 'assistant',
				content: [
					'Available commands:',
					'/help - Show this help message',
					'/clear - Clear the conversation',
					'/exit - Exit the application',
					'/model <name> - Switch AI model (coming soon)',
					'',
					'',
					'Or just type normally to chat!',
				].join('\n'),
			};
			setMessages([...messages, helpMessage]);
			return true;
		}

		if (trimmed.startsWith('/model')) {
			const parts = trimmed.split(' ');
			if (parts.length === 1) {
				const currentModelMessage: Message = {
					id: messages.length + 1,
					type: 'assistant',
					content: `Current model: ${currentModel}\n\nAvailable models:\n- claude-3-5-sonnet-20241022\n- claude-3-5-haiku-20241022\n- claude-3-opus-20240229\n\nUse /model <name> to switch`,
				};
				setMessages([...messages, currentModelMessage]);
			} else {
				const newModel = parts.slice(1).join(' ');
				if (aiService) {
					aiService.setModel(newModel);
					setCurrentModel(newModel);
					const successMessage: Message = {
						id: messages.length + 1,
						type: 'assistant',
						content: `Switched to model: ${newModel}`,
					};
					setMessages([...messages, successMessage]);
				}
			}
			return true;
		}

		if (trimmed.startsWith('/')) {
			const errorMessage: Message = {
				id: messages.length + 1,
				type: 'assistant',
				content: `Unknown command: ${trimmed}. Type /help for available commands.`,
			};
			setMessages([...messages, errorMessage]);
			return true;
		}

		return false;
	};

	const handleSubmit = (value: string) => {
		if (value.trim()) {
			// Check if it's a command
			if (handleCommand(value)) {
				setInput('');
				return;
			}

			const newUserMessage: Message = {
				id: messages.length + 1,
				type: 'user',
				content: value,
			};
			setMessages([...messages, newUserMessage]);
			setInput('');

			// Generate AI response
			if (aiService) {
				setIsProcessing(true);
				aiService.generateResponse(value).then(responseText => {
					const response: Message = {
						id: messages.length + 2,
						type: 'assistant',
						content: responseText,
					};
					setMessages(previous => [...previous, response]);
					setIsProcessing(false);
				});
			} else {
				const errorResponse: Message = {
					id: messages.length + 2,
					type: 'assistant',
					content:
						'AI service not initialized. Please check your ANTHROPIC_API_KEY.',
				};
				setMessages(previous => [...previous, errorResponse]);
			}
		}
	};

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="round" borderColor="yellow" paddingX={1} paddingY={0}>
				<Box flexDirection="column" width="100%">
					<Box>
						<Text> Welcome to @ComputeSDK&apos;s </Text>
						<Text bold>Agent</Text>
						<Text>!</Text>
					</Box>
					<Text> </Text>
					<Text dimColor>/help for help</Text>
					<Text> </Text>
					<Text dimColor>cwd: {process.cwd()}</Text>
				</Box>
			</Box>

			<Box padding={1}>
				<Text dimColor>What are you going to build today?</Text>
			</Box>

			{/* Messages */}
			<Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingTop={1}>
				{messages.map(message => (
					<Box key={message.id} marginBottom={1}>
						{message.type === 'assistant' ? (
							<Text>
								<Text color="yellow">❯ 🤖</Text> {message.content}
							</Text>
						) : (
							<Text dimColor>
								<Text>›</Text> {message.content}
							</Text>
						)}
					</Box>
				))}
				{isProcessing && (
					<Box marginBottom={1}>
						<Text color="yellow">❯ 🤖 Thinking...</Text>
					</Box>
				)}
			</Box>

			{/* Input */}
			<Box borderStyle="round" borderColor="gray" paddingLeft={1}>
				<Text color="cyan">› </Text>
				<TextInput
					placeholder="Type your message..."
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
				/>
			</Box>
		</Box>
	);
}
