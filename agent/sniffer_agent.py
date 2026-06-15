import json
import time
import requests
import socket
from scapy.all import sniff, IP, TCP, UDP, ICMP
from datetime import datetime, timezone

with open('config.json') as f:
    CONFIG = json.load(f)

API_URL = CONFIG['api_url']
API_KEY = CONFIG['api_key']
INTERFACE = CONFIG.get('interface')
BATCH_SIZE = 50
BATCH_TIMEOUT = 5

buffer = []
session_id = None
last_flush = time.time()

def packet_to_dict(packet):
    if IP not in packet:
        return None
    d = {
        'captured_at': datetime.now(timezone.utc).isoformat(),
        'src_ip': packet[IP].src,
        'dst_ip': packet[IP].dst,
        'packet_size': len(packet),
    }
    if TCP in packet:
        d.update(protocol='TCP', src_port=packet[TCP].sport, dst_port=packet[TCP].dport)
    elif UDP in packet:
        d.update(protocol='UDP', src_port=packet[UDP].sport, dst_port=packet[UDP].dport)
    elif ICMP in packet:
        d.update(protocol='ICMP')
    else:
        d.update(protocol='OTHER')
    return d

def flush_buffer():
    global buffer, session_id, last_flush
    if not buffer:
        return
    try:
        r = requests.post(
            f"{API_URL}/api/ingest",
            headers={'X-API-Key': API_KEY},
            json={
                'hostname': socket.gethostname(),
                'interface': INTERFACE or 'default',
                'session_id': session_id,
                'packets': buffer
            },
            timeout=10
        )
        if r.ok:
            session_id = r.json().get('session_id', session_id)
            print(f"[+] Sent {len(buffer)} packets")
            buffer = []
        else:
            print(f"[-] Send failed: {r.status_code} — keeping buffer")
    except Exception as e:
        print(f"[-] Network error: {e} — keeping buffer")

def process_packet(packet):
    global last_flush
    d = packet_to_dict(packet)
    if d:
        buffer.append(d)
        if len(buffer) >= BATCH_SIZE or (time.time() - last_flush) > BATCH_TIMEOUT:
            flush_buffer()
            last_flush = time.time()

if __name__ == '__main__':
    print(f"[*] NetSniff agent starting -> {API_URL}")
    print(f"[*] Interface: {INTERFACE or 'all'} | batch size: {BATCH_SIZE}")
    print("[*] Press Ctrl+C to stop.")
    try:
        sniff(prn=process_packet, store=False, iface=INTERFACE)
    except KeyboardInterrupt:
        print("\n[*] Stopping - flushing remaining packets...")
        flush_buffer()
        print("[*] Done.")
