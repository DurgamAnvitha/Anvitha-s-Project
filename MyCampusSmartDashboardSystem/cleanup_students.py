import json
import requests

API_URL = "http://localhost:8080/api/students"

def cleanup():
    resp = requests.get(API_URL)
    if resp.status_code != 200:
        print("Failed to fetch students")
        return

    students = resp.json()
    seen_rfid = set()
    to_delete = []

    for s in students:
        rfid = s.get('rfidUid')
        if rfid in seen_rfid:
            to_delete.append(s['id'])
            print(f"Found duplicate RFID: {rfid} for student {s.get('name')} (ID: {s['id']})")
        else:
            seen_rfid.add(rfid)

    for sid in to_delete:
        print(f"Deleting duplicate student ID: {sid}")
        requests.delete(f"{API_URL}/{sid}")

if __name__ == "__main__":
    cleanup()
