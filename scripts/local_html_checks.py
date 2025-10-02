"""
Local HTML heuristic checks (fast, offline).
Checks for: doctype presence, lang attribute on <html>, presence of <title>, img alt attributes, duplicate IDs, forms without labels.
Run: python scripts/local_html_checks.py
"""
import os
import sys
from html.parser import HTMLParser

class SimpleHTMLChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.has_doctype = False
        self.html_lang = None
        self.has_title = False
        self.imgs_missing_alt = []
        self.ids = {}
        self.current_form_inputs = []
        self.forms_missing_labels = []
        self.in_title = False

    def handle_decl(self, decl):
        if decl.lower().startswith('doctype'):
            self.has_doctype = True

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.html_lang = attrs.get('lang')
        if tag == 'title':
            self.in_title = True
        if tag == 'img':
            if not attrs.get('alt'):
                self.imgs_missing_alt.append(self.getpos())
        if 'id' in attrs:
            nid = attrs['id']
            self.ids.setdefault(nid, 0)
            self.ids[nid] += 1
        if tag == 'input' or tag == 'textarea' or tag == 'select':
            name = attrs.get('name') or attrs.get('id') or str(self.getpos())
            self.current_form_inputs.append((name, attrs.get('id')))
        if tag == 'form':
            self.current_form_inputs = []
            # we will check after form ends

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'form':
            # simple heuristic: if form has inputs without ids/labels
            missing = [n for (n,i) in self.current_form_inputs if not i]
            if missing:
                self.forms_missing_labels.append(missing)
            self.current_form_inputs = []

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.has_title = True


def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        txt = f.read()
    parser = SimpleHTMLChecker()
    parser.feed(txt)

    results = {
        'path': path,
        'has_doctype': parser.has_doctype,
        'html_lang': parser.html_lang,
        'has_title': parser.has_title,
        'imgs_missing_alt_count': len(parser.imgs_missing_alt),
        'duplicate_ids': [k for k,v in parser.ids.items() if v>1],
        'forms_missing_labels_count': len(parser.forms_missing_labels)
    }
    return results


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    html_files = []
    for dirpath, dirnames, filenames in os.walk(root):
        for name in filenames:
            if name.lower().endswith('.html'):
                html_files.append(os.path.join(dirpath, name))
    if not html_files:
        print('No HTML files found.')
        return
    all_results = []
    for h in html_files:
        print('Checking', h)
        try:
            r = check_file(h)
            all_results.append(r)
            print('  doctype:', 'OK' if r['has_doctype'] else 'MISSING', ' lang=', r['html_lang'] or 'MISSING', ' title:', 'OK' if r['has_title'] else 'MISSING')
            if r['imgs_missing_alt_count']:
                print('  imgs missing alt:', r['imgs_missing_alt_count'])
            if r['duplicate_ids']:
                print('  duplicate ids:', r['duplicate_ids'])
            if r['forms_missing_labels_count']:
                print('  forms missing labels (heuristic):', r['forms_missing_labels_count'])
        except Exception as e:
            print('  ERROR parsing file:', e)
    # summary
    print('\nSummary:')
    total = len(all_results)
    missing_doctype = sum(1 for r in all_results if not r['has_doctype'])
    missing_lang = sum(1 for r in all_results if not r['html_lang'])
    missing_title = sum(1 for r in all_results if not r['has_title'])
    imgs_missing = sum(r['imgs_missing_alt_count'] for r in all_results)
    dup_ids = sum(len(r['duplicate_ids']) for r in all_results)
    forms_missing = sum(r['forms_missing_labels_count'] for r in all_results)
    print(f'  Files checked: {total}')
    print(f'  Missing doctype: {missing_doctype}')
    print(f'  Missing html lang: {missing_lang}')
    print(f'  Missing title: {missing_title}')
    print(f'  Images missing alt: {imgs_missing}')
    print(f'  Duplicate ids found: {dup_ids}')
    print(f'  Forms missing labels (heuristic): {forms_missing}')

if __name__ == '__main__':
    main()
