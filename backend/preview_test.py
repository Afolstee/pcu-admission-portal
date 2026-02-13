import requests

login = {'email':'admin@university.edu','password':'admin123'}
try:
    r = requests.post('http://localhost:5000/api/auth/login', json=login)
    print('login', r.status_code)
    if r.ok:
        token = r.json().get('token')
        headers = {'Authorization': f'Bearer {token}'}
        resp = requests.post('http://localhost:5000/api/admin/preview-admission-letter', json={'applicant_id': 1}, headers=headers)
        print('preview', resp.status_code)
        if resp.ok:
            with open('preview_test.pdf', 'wb') as f:
                f.write(resp.content)
            print('WROTE preview_test.pdf', len(resp.content))
        else:
            print('preview error:', resp.text)
    else:
        print('login error:', r.text)
except Exception as e:
    print('Error:', e)
