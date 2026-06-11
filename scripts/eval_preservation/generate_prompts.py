"""
generate_prompts.py - Generate 400 synthetic prompts across 4 domains with embedded PII.
Output: prompts.csv, pii_map.json
"""

import csv
import json
import random
import re
from pathlib import Path

from faker import Faker

FAKER = Faker()
OUT_DIR = Path(__file__).resolve().parent / "data"
OUT_DIR.mkdir(exist_ok=True)

DOMAINS = ["Finance", "Medicine", "Law", "Casual Q&A"]
PII_TYPES = [
    "email", "phone", "credit_card", "ssn", "iban",
    "bsn", "vin", "dob", "mac", "name"
]

PROMPTS_PER_DOMAIN = 100

def luhn_checksum(n: str) -> int:
    def digits_of(n):
        return [int(d) for d in str(n)]
    digits = digits_of(n)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    total = sum(odd_digits)
    for d in even_digits:
        total += sum(digits_of(d * 2))
    return total % 10

def generate_luhn_cc(length=16):
    while True:
        num = "".join(str(random.randint(0, 9)) for _ in range(length - 1))
        for check in range(10):
            candidate = num + str(check)
            if luhn_checksum(candidate) == 0:
                return candidate

def gen_email():
    return FAKER.email()

def gen_phone():
    return FAKER.phone_number()

def gen_credit_card():
    return generate_luhn_cc()

def gen_ssn():
    return f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"

def gen_iban():
    return FAKER.iban()

def gen_bsn():
    return f"{random.randint(100000000, 999999999)}"

def gen_vin():
    return FAKER.vin()

def gen_dob():
    return FAKER.date_of_birth(minimum_age=18, maximum_age=90).strftime("%Y-%m-%d")

def gen_mac():
    return FAKER.mac_address()

def gen_name():
    return FAKER.name()

PII_GENERATORS = {
    "email": gen_email,
    "phone": gen_phone,
    "credit_card": gen_credit_card,
    "ssn": gen_ssn,
    "iban": gen_iban,
    "bsn": gen_bsn,
    "vin": gen_vin,
    "dob": gen_dob,
    "mac": gen_mac,
    "name": gen_name,
}

REDACT_MAP = {
    "email": "[EMAIL]",
    "phone": "[PHONE]",
    "credit_card": "[CREDIT_CARD]",
    "ssn": "[SSN]",
    "iban": "[IBAN]",
    "bsn": "[BSN]",
    "vin": "[VIN]",
    "dob": "[DOB]",
    "mac": "[MAC]",
    "name": "[NAME]",
}

TEMPLATES = {}

TEMPLATES["Finance"] = [
    "My account registered under {name} with email {email} was charged twice on the credit card {credit_card}. Please investigate.",
    "Please transfer the outstanding balance from IBAN {iban} to the account of {name}. My phone is {phone}.",
    "I need to update my tax filing for SSN {ssn}. My date of birth is {dob} and you can reach me at {email}.",
    "The direct debit for card ending in {credit_card} failed. Account holder: {name}. Contact: {phone}.",
    "Please issue a new card to replace {credit_card} for customer {name}, DOB {dob}.",
    "My salary has not been deposited to IBAN {iban}. Payroll contact is {name} at {email}.",
    "I want to dispute a transaction on {credit_card} from last Tuesday. Name on account: {name}, phone {phone}.",
    "Please close the account linked to SSN {ssn} and email confirmation to {email}.",
    "The wire transfer to IBAN {iban} was rejected. Sender details: {name}, {phone}.",
    "I lost my wallet containing card {credit_card}. My SSN is {ssn}. Please freeze all accounts.",
    "Please update my contact number from the old one to {phone}. Email remains {email}.",
    "My credit report under SSN {ssn} shows an unknown account. Contact me at {email}.",
    "I would like to increase the credit limit on card {credit_card} for account holder {name}.",
    "The mortgage application for {name}, DOB {dob}, SSN {ssn}, needs additional verification. Contact {email}.",
    "Please send the annual statement to {email} for account IBAN {iban}.",
    "I am travelling abroad and card {credit_card} was declined. Reach me at {phone}.",
    "I want to add {name} as an authorised user to card {credit_card}. Their email is {email}.",
    "Please change the billing address for account SSN {ssn}. Notify me at {email}.",
    "The recurring payment from IBAN {iban} should be cancelled. Confirmation to {phone}.",
    "My tax refund is missing for SSN {ssn}. DOB: {dob}. Best contact: {email}.",
    "I am disputing a charge from last month on my statement for card {credit_card}. Name: {name}.",
    "Please verify the identity of {name} using SSN {ssn}. Call {phone} if needed.",
    "My online banking access for {email} is locked. Account: IBAN {iban}.",
    "I want to wire funds to beneficiary {name} at IBAN {iban}. My phone is {phone}.",
    "Please generate a balance certificate for account SSN {ssn} and email it to {email}.",
]

TEMPLATES["Medicine"] = [
    "Patient {name}, DOB {dob}, was admitted with chest pain. Contact {phone} or {email}. Insurance SSN: {ssn}.",
    "Lab results for {name} (DOB {dob}) are ready. Please send them to {email}.",
    "Prescription refill requested for {name}. Pharmacy will call {phone}. Insurance card: {ssn}.",
    "Appointment reminder: {name} on Friday at 10am. Confirm via {email} or {phone}.",
    "Medical history for {name}, SSN {ssn}, needs update before the procedure. DOB: {dob}.",
    "Please send the MRI results for {name} to {email}. Urgent contact: {phone}.",
    "Patient {name} reports allergy to penicillin. Update records under SSN {ssn}.",
    "The referral for {name} to cardiology was approved. Notify at {email}.",
    "Billing inquiry for procedure on {dob} for patient {name}. Insurance: SSN {ssn}.",
    "Telemedicine link sent to {email} for {name}'s appointment. Backup phone: {phone}.",
    "Discharge summary for {name}, DOB {dob}, needs sign-off. Send to {email}.",
    "Pharmacy requests clarification on prescription for {name}. Call {phone}. ID: SSN {ssn}.",
    "Wellness check results for {name} are normal. Report emailed to {email}.",
    "Please update emergency contact for {name} to {phone} and {email}.",
    "Vaccination record for {name}, DOB {dob}, available at {email} upon request.",
    "Surgery scheduled for {name} on Monday. Pre-op instructions sent to {email}. Contact {phone}.",
    "Radiology report for {name} (SSN {ssn}) is now in the portal. Notify {email}.",
    "Follow-up appointment for {name} must be rescheduled. Call {phone}.",
    "Patient {name} requests a copy of records from DOB {dob}. Send to {email}.",
    "Insurance pre-authorization denied for {name}, SSN {ssn}. Appeal via {email}.",
    "Physical therapy assessment for {name} at 2pm. Contact {phone} if running late.",
    "Please confirm receipt of medical records for {name} sent to {email}.",
    "Blood work for {name}, DOB {dob}, shows elevated levels. Discuss with {phone}.",
    "Mental health consult for {name} is confidential. Notes sent only to {email}.",
    "Patient portal activation for {name}. Verify identity with SSN {ssn} and DOB {dob}.",
]

TEMPLATES["Law"] = [
    "Client {name}, DOB {dob}, is filing a claim regarding property damage. Contact: {email}, {phone}.",
    "Contract review for client {name}. Please send the draft to {email}. Reference: SSN {ssn}.",
    "Deposition of {name} scheduled for next Wednesday. Confirmation to {email}.",
    "Power of attorney for {name} requires notarisation. DOB: {dob}. Phone: {phone}.",
    "Please file the motion for client {name} (case ID SSN {ssn}). Serve at {email}.",
    "Estate planning for {name}. All documents will be sent to {email}. Executor phone: {phone}.",
    "Client intake form completed for {name}, DOB {dob}. SSN: {ssn}. Email: {email}.",
    "Divorce settlement draft for {name} is ready for review. Send to {email}.",
    "Please subpoena records for {name}, SSN {ssn}. Notify {phone} when served.",
    "The court date for {name} has been moved. Update calendar and email {email}.",
    "Client {name} wishes to amend the complaint. Discussion notes to {email}.",
    "Witness statement from {name}, DOB {dob}, filed under seal. Contact {phone}.",
    "Please prepare the trust documents for {name}. Beneficiary SSN: {ssn}. Email {email}.",
    "Legal opinion on regulatory matter for client {name}. Draft to {email}. Call {phone} to discuss.",
    "The lease agreement for {name} needs revision. Send updated copy to {email}.",
    "Litigation hold notice for {name}. Preserve all communications at {email}.",
    "Client {name} requests a conflict check. DOB: {dob}. Current matters under SSN {ssn}.",
    "Please finalise the incorporation papers for {name}. Director email: {email}. Phone: {phone}.",
    "Notice of appeal filed for {name}. Confirmation and schedule to {email}.",
    "Mediation brief for {name} due Friday. Please cc {email} on all filings.",
    "The trademark application for client {name} is pending. Examiner contact: {email}.",
    "Discovery responses for {name} (SSN {ssn}) need review. Deadline extended to {phone}.",
    "Please draft the settlement agreement for {name}. Terms sent to {email}.",
    "Client {name}, DOB {dob}, seeks custody modification. Contact {phone} or {email}.",
    "The compliance audit for {name} requires SSN verification. Submit to {email}.",
]

TEMPLATES["Casual Q&A"] = [
    "Hey, I'm {name} and my email is {email}. Can you help me plan a birthday party for someone born on {dob}?",
    "I forgot my gym membership number. It might be under {phone} or {email}. My name is {name}.",
    "Can you recommend a good restaurant near {phone}'s area code? I'm {name}, my email is {email} for the reservation.",
    "My friend {name} (email: {email}) is visiting next week. What should we do in town?",
    "I'm trying to reset my password. My recovery email is {email} and my name is {name}. DOB: {dob}.",
    "Hi, my MAC address {mac} keeps disconnecting from the router. Any advice? Name is {name}.",
    "I need gift ideas for someone turning 30 on {dob}. You can email suggestions to {email}. Thanks, {name}!",
    "My phone {phone} isn't receiving verification codes. Can you help, {name} here, alt email {email}.",
    "I want to return a package. Order under {name}, email {email}, phone {phone}.",
    "What's the weather like for a road trip? My VIN is {vin} and I need to know if the car is winter-ready. Name: {name}.",
    "Can you draft an apology email for me? My name is {name}, send the draft to {email}.",
    "I'm booking a hotel for {name}, checking in on {dob}. Contact {email} for confirmation.",
    "My streaming account under {email} is locked. Name: {name}. Can you help?",
    "What's a good workout routine for someone born in {dob}? I'm {name}, email {email} if you have plans.",
    "I'm {name}, my phone {phone} broke. Can I still use my account with just {email}?",
    "I need to find my loyalty card number. It's under {name}, phone {phone}, or email {email}.",
    "Can you translate a letter from Spanish? Send the translation to {email}. I'm {name}.",
    "I'm {name} and my car VIN is {vin}. Is there a recall on this model?",
    "Help me write a bio for my profile. I'm {name}, DOB {dob}, reachable at {email}.",
    "My internet provider needs my MAC address {mac} to troubleshoot. Name: {name}, phone: {phone}.",
    "I'm registering for a marathon as {name}. Emergency contact: {phone}, medical info to {email}.",
    "Can I change my appointment? Name: {name}, DOB: {dob}, confirmation to {email}.",
    "I need to cancel a service. Account under {name}, SSN {ssn}, email {email}.",
    "Please help me compose a farewell message. I'm {name}, colleagues can reach me at {email} and {phone}.",
    "My device with MAC {mac} won't connect to Bluetooth. I'm {name}. Advice to {email} please.",
]

def generate():
    prompt_id = 0
    csv_rows = []
    pii_map = {}

    for domain in DOMAINS:
        templates = TEMPLATES[domain]
        for _ in range(PROMPTS_PER_DOMAIN):
            template = random.choice(templates)

            # Collect which PII types appear in this template
            used_types = [t for t in PII_TYPES if "{" + t + "}" in template]

            # Generate values
            values = {t: PII_GENERATORS[t]() for t in used_types}

            # Fill template
            prompt_text = template.format(**values)

            prompt_id += 1
            pid = f"{prompt_id:04d}"

            csv_rows.append({
                "prompt_id": pid,
                "domain": domain,
                "original_prompt": prompt_text,
            })

            # Build PII map entry
            entry = {}
            for t in used_types:
                replacement = PII_GENERATORS[t]()
                entry[t] = {
                    "original": values[t],
                    "redacted": REDACT_MAP[t],
                    "replacement": replacement,
                }

            pii_map[pid] = entry

    # Write CSV
    csv_path = OUT_DIR / "prompts.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["prompt_id", "domain", "original_prompt"])
        writer.writeheader()
        writer.writerows(csv_rows)

    # Write PII map
    json_path = OUT_DIR / "pii_map.json"
    with open(json_path, "w") as f:
        json.dump(pii_map, f, indent=2)

    print(f"Generated {prompt_id} prompts -> {csv_path}")
    print(f"PII map written -> {json_path}")


if __name__ == "__main__":
    generate()
