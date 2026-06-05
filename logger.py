import time
import requests
from pynput import keyboard, mouse


API_URL = "http://localhost:3000/api/fatigue-data"



last_key_time = time.time()
last_click_time = time.time()
key_latencies = []
click_intervals = []
pauses = []
last_activity_time = time.time()

def on_press(key):
    global last_key_time, last_activity_time
    current_time = time.time()
    latency = current_time - last_key_time
    if latency < 2.0: 
        key_latencies.append(latency)
    
    check_pause(current_time)
    last_key_time = current_time
    last_activity_time = current_time

def on_click(x, y, button, pressed):
    global last_click_time, last_activity_time
    if pressed:
        current_time = time.time()
        interval = current_time - last_click_time
        if interval < 5.0:
            click_intervals.append(interval)
        
        check_pause(current_time)
        last_click_time = current_time
        last_activity_time = current_time

def check_pause(current_time):
    global last_activity_time
    pause = current_time - last_activity_time
    if pause > 2.0:
        pauses.append(pause)

def send_data():
    if not key_latencies and not click_intervals:
        return

    avg_key = sum(key_latencies) / len(key_latencies) * 1000 if key_latencies else 0
    avg_click = sum(click_intervals) / len(click_intervals) * 1000 if click_intervals else 0
    avg_pause = sum(pauses) / len(pauses) if pauses else 0

    payload = {
        "avg_key_latency": round(avg_key, 2),
        "click_interval": round(avg_click, 2),
        "pause_time": round(avg_pause, 2)
    }

    try:
        response = requests.post(API_URL, json=payload)
        print(f"Sent to Dashboard: {payload} | Status: {response.status_code}")
    except Exception as e:
        print(f"Failed to send data: {e}")

    
    key_latencies.clear()
    click_intervals.clear()
    pauses.clear()


key_listener = keyboard.Listener(on_press=on_press)
mouse_listener = mouse.Listener(on_click=on_click)

key_listener.start()
mouse_listener.start()

print("Digital Fatigue Twin Logger Started...")
print(f"Monitoring activity and sending to {API_URL} every 10 seconds.")

try:
    while True:
        time.sleep(10)
        send_data()
except KeyboardInterrupt:
    print("\nStopping logger...")
    key_listener.stop()
    mouse_listener.stop()
