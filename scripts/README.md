W3C Validation helpers

This folder contains two helper tools to validate HTML files in this project:

1) PowerShell script: `w3c_validate.ps1`
   - Posts each HTML file to the W3C Nu Validator and saves JSON results in `validation-results/`.
   - Usage (Windows PowerShell):
     - Open PowerShell in the project root (where `index.html` is).
     - Run: `.\	emplates\scripts\w3c_validate.ps1`  <-- NOTE: use the correct path: `.\scripts\w3c_validate.ps1`

2) Python heuristic checker: `local_html_checks.py`
   - Runs quick offline checks: doctype, html lang, title presence, images missing alt, duplicate ids, and forms without labelled inputs.
   - Usage (requires Python 3):
     - Run: `python scripts/local_html_checks.py`

Notes:
- The PowerShell script requires network access and will POST each HTML file to the W3C service. Expect JSON responses saved to `validation-results/`.
- The Python checker is not a replacement for W3C validation; it's a quick pre-flight to catch common issues offline.

If you'd like, I can:
- Run the Python checks now and report findings.
- Run the W3C validator remotely for you (I can't run network requests from here), but I can prepare the outputs and walk you through running the PowerShell script locally.
