import re
from Rules import COMPLIANCE_RULES

# Heuristics mapping for each rule ID
RULE_HEURISTICS = {
    "LIABILITY_LIMITATION": [r"limit[\w\s]{0,20}liability", r"indirect damages", r"consequential damages", r"liability shall not exceed", r"liability cap"],
    "CONFIDENTIALITY": [r"confidential information", r"non-disclosure", r"nda", r"confidentiality obligations"],
    "IP_OWNERSHIP": [r"intellectual property", r"ip ownership", r"licensing terms", r"copyrights", r"patents", r"trademarks", r"moral rights", r"work made for hire", r"sole owner"],
    "TERMINATION_CONVENIENCE": [r"termination for convenience", r"terminate[\w\s]{0,20}without cause", r"prior written notice", r"at its convenience"],
    "TERMINATION_CAUSE": [r"termination for cause", r"material breach", r"terminate[\w\s]{0,20}default", r"non-performance", r"for breach"],
    "GOVERNING_LAW": [r"governing law", r"jurisdiction", r"applicable law", r"construed in accordance with", r"courts of"],
    "INDEMNIFICATION": [r"indemnif", r"hold harmless", r"defend[\w\s]{0,20}against claims", r"indemnification"],
    "ASSIGNMENT": [r"assignment", r"transfer rights", r"cannot assign", r"assign its rights", r"without prior written consent"],
    "EXCLUSIVITY": [r"exclusivity", r"exclusive rights", r"sole provider", r"sole and exclusive", r"restrict[\w\s]{0,20}competitors"],
    "PAYMENT_TERMS": [r"payment terms", r"invoice", r"net \d+", r"payment schedule", r"late fee", r"interest on late payments"],
    "RENEWAL": [r"renewal", r"auto-renew", r"extension terms", r"automatically renew", r"extend the term"],
    "FORCE_MAJEURE": [r"force majeure", r"act of god", r"natural disaster", r"beyond reasonable control", r"unforeseen circumstances"],
    "AUDIT_RIGHTS": [r"audit rights", r"right to audit", r"inspect records", r"audit and inspection", r"examination of books"],
    "DISPUTE_RESOLUTION": [r"dispute resolution", r"arbitration", r"mediation", r"amicably resolve", r"binding arbitration"],
    "NON_COMPETE": [r"non-compete", r"covenant not to compete", r"competing business", r"restrictive covenant", r"non-solicitation"]
}

def analyze_document(text):
    text_lower = text.lower()
    
    results = []
    
    for rule in COMPLIANCE_RULES:
        rule_id = rule["id"]
        heuristics = RULE_HEURISTICS.get(rule_id, [])
        
        passed = False
        match_snippet = None
        
        if heuristics:
            for pattern in heuristics:
                match = re.search(pattern, text_lower)
                if match:
                    passed = True
                    # Try to extract a snippet around the match
                    start = max(0, match.start() - 80)
                    end = min(len(text), match.end() + 80)
                    match_snippet = "... " + text[start:end].replace('\n', ' ').strip() + " ..."
                    break
                    
        results.append({
            "id": rule["id"],
            "title": rule["title"],
            "description": rule["description"],
            "category": rule["category"],
            "passed": passed,
            "snippet": match_snippet if passed else None
        })
        
    return results
