import process from 'node:process';
import React, {useState} from 'react';
import {Box, Text, useInput, useApp} from 'ink';
import TextInput from 'ink-text-input';

type Message = {
	id: number;
	type: 'user' | 'assistant';
	content: string;
};

export default function App() {
	const {exit} = useApp();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');

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
				content: `Available commands:
/help - Show this help message
/clear - Clear the conversation
/exit - Exit the application
/model <name> - Switch AI model (coming soon)

Or just type normally to chat!`,
			};
			setMessages([...messages, helpMessage]);
			return true;
		}
		
		if (trimmed.startsWith('/model')) {
			const modelMessage: Message = {
				id: messages.length + 1,
				type: 'assistant',
				content: 'Model switching coming soon!',
			};
			setMessages([...messages, modelMessage]);
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

			// Simulate assistant response
			setTimeout(() => {
				const response: Message = {
					id: messages.length + 2,
					type: 'assistant',
					content:
						"I'll help you with code-related tasks. What would you like me to help you with?",
				};
				setMessages(previous => [...previous, response]);
			}, 500);
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
