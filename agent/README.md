# NetSniff Cloud — Capture Agent

This is the local agent for [NetSniff Cloud](https://netsniff-cloud.vercel.app). It captures network packet metadata on your machine and sends it to your dashboard, where you can view and filter your traffic live.

## Requirements

- **Linux** (e.g. Kali, Ubuntu). The agent needs root access for raw packet capture, so it does not run on standard Windows/macOS without extra setup.
- **Python 3** and `sudo` privileges.
- A free account at [netsniff-cloud.vercel.app](https://netsniff-cloud.vercel.app).

## What it captures

Only Layer 3/4 **metadata** — protocol, source/destination IP, ports, packet size, and timestamp. It **never** captures packet contents (payloads), for privacy and legal safety.

## Setup

```bash
# 1. Clone the repo and enter the agent folder
git clone https://github.com/sathwika-net/netsniff-cloud.git
cd netsniff-cloud/agent

# 2. Create an isolated Python environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Get your API key
#    Log in at netsniff-cloud.vercel.app, open the "API Keys" page,
#    and generate a key (it is shown only once).

# 4. Create your config from the template and paste your key in
cp config.example.json config.json
#    Edit config.json - set "api_key" to your key. Leave "api_url" as is.

# 5. Run the agent (sudo is required for packet capture)
sudo python3 sniffer_agent.py
```

You'll see `[+] Sent NN packets` as it works. Open your dashboard in the browser and your traffic appears live - filter it by protocol from the dropdown.

## Notes

- `config.json` holds your secret API key and is **gitignored** - never commit it.
- Press `Ctrl+C` to stop the agent.
- Each user only sees their own traffic; your data is isolated from every other user's.
