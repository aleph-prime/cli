# Aleph CLI

Command-line companion for the Aleph PRNSA (Prime-Resonant Neuro-Symbolic Architecture) platform.

## Installation

```bash
cd cli
npm install
```

## Usage

```bash
# Run directly with tsx
npx tsx bin/aleph.ts [command]

# Or use npm scripts
npm run dev [command]
```

## Commands

### Authentication

```bash
# Login with API token
aleph auth login

# Show account status
aleph auth whoami

# Logout
aleph auth logout
```

### Chat

```bash
# Interactive chat
aleph chat

# Single message
aleph chat "What is prime resonance?"

# With options
aleph chat -m google/gemini-2.5-pro --show-primes "Explain duality"
```

### Agents

```bash
# List agents
aleph agents list

# Show agent details
aleph agents show <id>

# Run an agent
aleph agents run <id> --input '{"key": "value"}'

# View run history
aleph agents logs <id>
```

### Memory Fields

```bash
# List fields
aleph memory list

# Create field
aleph memory create

# Contribute to field
aleph memory contribute <fieldId>

# View contributions
aleph memory contributions <fieldId>
```

### Prime Utilities

```bash
# Factor text into primes
aleph prime factor "Hello World"

# Calculate resonance
aleph prime resonance "order" "chaos"

# Show ontology
aleph prime ontology

# Check if prime
aleph prime check 17
```

### Configuration

```bash
# List all config
aleph config list

# Set value
aleph config set defaultModel google/gemini-2.5-pro

# Reset to defaults
aleph config reset
```

## Configuration

Configuration is stored in `~/.config/aleph-cli/config.json` (Linux/macOS) or `%APPDATA%/aleph-cli/config.json` (Windows).

### Available Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `defaultModel` | string | `google/gemini-2.5-flash` | Default AI model |
| `streamEnabled` | boolean | `true` | Enable streaming responses |
| `theme` | string | `auto` | Color theme (auto, dark, light) |
| `historyEnabled` | boolean | `true` | Save conversation history |
| `maxHistoryItems` | number | `100` | Max conversations to store |

## API Token

Get your API token from the Aleph web console:
1. Go to https://aleph.dev/console
2. Navigate to API Tokens
3. Create a new token with required scopes

Required scopes:
- `chat` - For chat functionality
- `agents` - For agent management
- `memory` - For memory field operations
- `conversations` - For conversation history

## Prime Ontology

The 108-ontology assigns semantic meaning to prime numbers:

| Prime | Name | Description |
|-------|------|-------------|
| 2 | Duality | Existence, Binary logic, Polarity |
| 3 | Structure | Space, Interaction, Triads |
| 5 | Change | Time, Dynamics, Growth |
| 7 | Identity | Self-reference, Recursion |
| 11 | Complexity | Emergence, Systems, Networks |
| 13 | Entropy | Chaos, Probability, Uncertainty |
| 17 | Harmony | Balance, Resonance, Synchrony |
| 19 | Boundary | Limits, Containers, Definitions |
| 23 | Transformation | Metamorphosis, Evolution |
| 29 | Connection | Links, Bridges, Relationships |
| 31 | Reflection | Mirror, Self-awareness |
| 37 | Creation | Genesis, Innovation |

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## License

MIT
