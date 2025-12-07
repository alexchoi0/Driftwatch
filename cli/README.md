# RabbitBench CLI

Command-line tool for submitting benchmark results to RabbitBench.

## Installation

### From source

```bash
cargo install --path cli
```

### Pre-built binary

Download from [releases](https://github.com/yourusername/rabbitbench/releases) and add to your PATH.

## Authentication

### Browser login (recommended)

```bash
rabbitbench auth login
```

This will:
1. Open your browser to the RabbitBench login page
2. After you authenticate, redirect back to the CLI
3. Save your credentials locally

```
$ rabbitbench auth login

Opening browser for authentication...

If the browser doesn't open, visit this URL:
https://rabbitbench.dev/cli-auth?callback=http%3A%2F%2F127.0.0.1%3A54321%2Fcallback

Waiting for authentication...
Validating token...

Authenticated as: user@example.com
Config saved to: ~/Library/Application Support/rabbitbench/config.toml
```

### API token login

If you prefer, you can create an API token in your [dashboard settings](https://rabbitbench.dev/settings) and use it directly:

```bash
rabbitbench auth login --token rb_your_api_token_here
```

### Environment variables

You can also set credentials via environment variables:

```bash
export RABBITBENCH_TOKEN=rb_your_api_token_here
export RABBITBENCH_API_URL=https://rabbitbench.dev  # optional, for self-hosted
```

### Check status

```bash
rabbitbench auth status
```

### Logout

```bash
rabbitbench auth logout
```

## Usage

### Submit benchmark results

Pipe your benchmark output to `rabbitbench run`:

```bash
cargo bench -- --save-baseline main | rabbitbench run \
  --project my-project \
  --branch main \
  --testbed local
```

Supported benchmark formats:
- Criterion (Rust)
- More coming soon

### Options

```
rabbitbench run [OPTIONS]

Options:
  --project <SLUG>     Project slug (required)
  --branch <NAME>      Branch name (required)
  --testbed <NAME>     Testbed name (required)
  --git-hash <HASH>    Git commit hash (auto-detected if in git repo)
  --adapter <TYPE>     Benchmark adapter [default: criterion]
```

### List projects

```bash
rabbitbench project list
```

### Create a project

```bash
rabbitbench project create --slug my-project --name "My Project"
```

## Self-hosted instances

For self-hosted RabbitBench instances, specify the API URL:

```bash
# During login
rabbitbench auth login --api-url https://your-instance.com

# Or via environment variable
export RABBITBENCH_API_URL=https://your-instance.com
rabbitbench auth login
```

## Configuration

Config is stored at:
- macOS: `~/Library/Application Support/rabbitbench/config.toml`
- Linux: `~/.config/rabbitbench/config.toml`
- Windows: `%APPDATA%\rabbitbench\config.toml`

Example config:
```toml
token = "rb_your_api_token"
api_url = "https://rabbitbench.dev"
```
