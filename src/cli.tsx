#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

meow(
	`
	Usage
	  $ agent

	A terminal agent for code-related tasks
`,
	{
		importMeta: import.meta,
	},
);

render(<App />);
